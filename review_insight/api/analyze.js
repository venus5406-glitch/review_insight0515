const { OpenAI } = require("openai");
const supabase = require("../lib/supabase");
const { encryptText } = require("../lib/encryption");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 프론트엔드의 요청을 받아 OpenAI에 감성 분석을 요청하고,
 * 그 결과를 Supabase에 암호화하여 저장한 뒤 프론트엔드로 반환하는 컨트롤러입니다.
 */
async function analyzeSentiment(req, res) {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ success: false, message: "텍스트가 입력되지 않았습니다." });
  }

  if (text.length > 1000) {
    return res.status(400).json({ success: false, message: "텍스트는 1000자를 초과할 수 없습니다." });
  }

  try {
    // 1. OpenAI API 호출
    const prompt = `
당신은 문장의 감성을 분석하는 AI 전문가입니다.
다음 텍스트의 감성을 분석하여 JSON 형태로만 답변해 주세요.

텍스트: "${text}"

응답 형식:
{
  "sentiment": "positive 또는 negative 또는 neutral 중 하나",
  "confidence": 신뢰도 (0에서 100 사이의 정수),
  "reason": "감성을 이렇게 판단한 이유 (한국어로 2~3문장)"
}
`;

    // OpenAI API 요청 (환경 변수가 설정되지 않은 경우를 대비한 방어 로직)
    let aiResult;
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 또는 gpt-3.5-turbo
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // JSON 응답 강제
        temperature: 0.2, // 일관된 답변을 위해 낮게 설정
      });

      aiResult = JSON.parse(response.choices[0].message.content);
    } else {
      // API Key가 없을 경우의 임시 모의 데이터
      console.warn("OpenAI API 키가 없습니다. 모의 데이터를 반환합니다.");
      aiResult = {
        sentiment: "neutral",
        confidence: 85,
        reason: "OpenAI API 키가 설정되지 않아 임시 중립 결과를 반환합니다."
      };
    }

    // 2. 한글 라벨 매핑
    const sentimentLabelMap = {
      positive: "긍정",
      negative: "부정",
      neutral: "중립"
    };
    
    // 혹시라도 이상한 값이 오면 neutral 처리
    const validSentiment = sentimentLabelMap[aiResult.sentiment] ? aiResult.sentiment : "neutral";
    const sentimentLabel = sentimentLabelMap[validSentiment];
    const confidence = typeof aiResult.confidence === 'number' ? aiResult.confidence : 80;
    const reason = aiResult.reason || "이유 분석 실패";

    // 3. Supabase에 분석 결과 및 암호화된 텍스트 저장
    if (supabase) {
      // 원본 텍스트 암호화 (보안 수칙)
      const encryptedText = encryptText(text);

      const { error } = await supabase
        .from("sentiment_analyses")
        .insert([{
          input_text: encryptedText,
          sentiment: validSentiment,
          sentiment_label: sentimentLabel,
          confidence: confidence,
          reason: reason
        }]);

      if (error) {
        console.error("Supabase 저장 에러:", error.message);
        // 저장에 실패하더라도 사용자에게 결과는 보여주기 위해 throw하지 않음
      }
    }

    // 4. 프론트엔드로 최종 결과 응답
    res.status(200).json({
      success: true,
      data: {
        sentiment: validSentiment,
        sentimentLabel: sentimentLabel,
        confidence: confidence,
        reason: reason
      }
    });

  } catch (error) {
    console.error("감성 분석 중 에러:", error);
    res.status(500).json({ success: false, message: "감성 분석 중 서버 오류가 발생했습니다." });
  }
}

module.exports = { analyzeSentiment };
