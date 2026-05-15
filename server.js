const express = require("express");
const cors = require("cors");
const path = require("path");
const analyzeSentiment = require("./api/analyze");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 프론트엔드 정적 파일 서빙
app.use(express.static(path.join(__dirname, "public")));

// API 라우트
app.post("/api/analyze", analyzeSentiment);

// 모든 기타 요청은 index.html 반환
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`로컬 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
