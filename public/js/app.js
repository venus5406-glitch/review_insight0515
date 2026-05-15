// HTML에서 사용될 주요 DOM 요소들을 선택합니다.
const textarea = document.querySelector("#sentimentText");
const charCount = document.querySelector("#charCount");
const analyzeButton = document.querySelector("#analyzeButton");
const errorMessage = document.querySelector("#errorMessage");

const modalBackdrop = document.querySelector("#resultModalBackdrop");
const modalCloseButton = document.querySelector("#modalCloseButton");
const modalConfirmButton = document.querySelector("#modalConfirmButton");

const resultEmoji = document.querySelector("#resultEmoji");
const resultLabel = document.querySelector("#resultLabel");
const resultConfidence = document.querySelector("#resultConfidence");
const resultReason = document.querySelector("#resultReason");

// 감성별 색상 및 이모지 매핑 설정
const sentimentConfig = {
  positive: { color: "var(--color-green-accent)", emoji: "😊" },
  negative: { color: "var(--color-error)", emoji: "😠" },
  neutral: { color: "var(--color-text-sub)", emoji: "😐" }
};

// 1. 텍스트 입력 시 실시간 글자수 계산 및 에러 숨김
textarea.addEventListener("input", () => {
  const length = textarea.value.length;
  charCount.textContent = `${length} / 1000`;

  // 1,000자 초과 시 카운터 글자를 빨간색으로 변경
  if (length > 1000) {
    charCount.style.color = "var(--color-error)";
  } else {
    charCount.style.color = "var(--color-text-sub)";
  }

  hideError(); // 타이핑할 때는 기존 에러 메시지 초기화
});

// 에러 메시지 제어 함수들
function hideError() {
  errorMessage.style.display = "none";
  errorMessage.textContent = "";
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = "block";
}

// 2. 모달 열기 및 데이터 주입 함수
function openModal(data) {
  // 결과에 따른 색상/이모지 설정 가져오기 (없으면 중립으로 대체)
  const config = sentimentConfig[data.sentiment] || sentimentConfig.neutral;

  // DOM 요소에 데이터 반영
  resultEmoji.textContent = config.emoji;
  resultLabel.textContent = data.sentimentLabel;
  resultLabel.style.color = config.color;

  resultConfidence.textContent = `신뢰도 ${data.confidence}%`;
  resultReason.textContent = data.reason;

  // 모달을 화면에 표시
  modalBackdrop.classList.add("show");
}

// 모달 닫기 함수
function closeModal() {
  modalBackdrop.classList.remove("show");
}

// 3. 모달 닫기 이벤트 리스너 세팅
modalCloseButton.addEventListener("click", closeModal);
modalConfirmButton.addEventListener("click", closeModal);
// 모달 바깥쪽 회색 배경 클릭 시 닫기
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});
// ESC 키를 눌렀을 때 닫기
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalBackdrop.classList.contains("show")) closeModal();
});

// 4. 메인 분석 버튼 클릭 이벤트 처리
analyzeButton.addEventListener("click", async () => {
  const text = textarea.value.trim();

  // 입력값 검증 (빈 문자열)
  if (!text) {
    showError("분석할 텍스트를 입력해주세요.");
    return;
  }

  // 입력값 검증 (1000자 초과)
  if (text.length > 1000) {
    showError("텍스트는 최대 1,000자까지 입력할 수 있습니다.");
    return;
  }

  // 로딩 상태 시작 (버튼 비활성화 및 텍스트 변경)
  analyzeButton.disabled = true;
  analyzeButton.textContent = "분석 중...";
  hideError();

  try {
    // 실제 서버(Node.js API) 연동
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "오류가 발생했습니다.");
    }
    
    // 실제 백엔드에서 받은 결과로 모달 띄우기
    openModal(result.data);

  } catch (error) {
    showError("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    console.error(error);
  } finally {
    // 로딩 상태 종료 (버튼 원래대로 복구)
    analyzeButton.disabled = false;
    analyzeButton.textContent = "감성분석";
  }
});
