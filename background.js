console.log("✅ DOM Extractor 백그라운드 실행됨");

// 백그라운드 -> content script 메시지 리스너 설정
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
// dom 추출 요청 
    case "extractDom":
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const tabId = tabs[0].id;

    chrome.tabs.sendMessage(tabId, { action: "getDomTreeData" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ 메시지 전송 실패:", chrome.runtime.lastError.message);
        sendResponse({ status: "error", error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ status: "success"});
      }
    });
  });

  return true;


  // 텍스트 요약 요청
    case "summarizeText":
      console.log("🧠 요약 요청 수신. 텍스트 길이:", message.text.length);

      fetch("http://localhost:5001/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.text })
      })
      .then(response => response.json())
      .then(data => {
        console.log("✅ 요약 응답:", data.summary);
        sendResponse({ summary: data.summary });
      })
      .catch(error => {
        console.error("❌ 요약 오류:", error);
        sendResponse({ summary: "요약 실패: " + error.message });
      });

      return true;

    case "captionImage":
      console.log("📸 이미지 캡션 요청:", message);

      fetch("http://localhost:5001/caption-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: message.imageUrl,
          tag: message.tag || "img",
          duration_seconds: message.duration_seconds || 0
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log("✅ 캡션 응답:", data.caption);
        sendResponse({ caption: data.caption, summary: data.summary || null });
      })
      .catch(error => {
        console.error("❌ 캡션 오류:", error);
        sendResponse({ caption: null, summary: null, error: error.message });
      });

      return true;

    default:
      console.warn("⚠️ 알 수 없는 메시지 action:", message.action);
  }
});
