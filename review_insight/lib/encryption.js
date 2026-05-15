// Node.js 기본 내장 모듈인 crypto를 사용하여 AES-256-CBC 암호화를 구현합니다.
const crypto = require("crypto");
require("dotenv").config();

// 환경 변수에서 32바이트 키를 가져옵니다.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const IV_LENGTH = 16; // AES 블록 크기인 16바이트

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.warn("경고: ENCRYPTION_KEY가 32바이트(문자)로 설정되지 않았습니다. 기본 테스트 키를 사용합니다.");
}

const key = ENCRYPTION_KEY && ENCRYPTION_KEY.length === 32 ? ENCRYPTION_KEY : "0123456789abcdef0123456789abcdef";

/**
 * 평문 텍스트를 암호화합니다.
 * @param {string} text - 원본 텍스트
 * @returns {string} iv와 암호문이 결합된 16진수 문자열
 */
function encryptText(text) {
  if (!text) return text;
  
  // 매 암호화마다 랜덤한 초기화 벡터(IV) 생성
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // 복호화를 위해 iv와 암호문을 함께 반환 (구분자: :)
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * 암호문을 복호화합니다.
 * @param {string} text - iv:암호문 형태의 문자열
 * @returns {string} 복호화된 원본 텍스트
 */
function decryptText(text) {
  if (!text) return text;
  
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

module.exports = {
  encryptText,
  decryptText
};
