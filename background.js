// console.log("DOM Extractor 백그라운드 실행됨");
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "extractDom") {
//       console.log(message.data)
//     }
//   });


console.log("✅ DOM Extractor 백그라운드 실행됨");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractDom") {
    console.log("📥 DOM 추출 메시지 수신:", message.data);
    return;  // sendResponse 없음
  }

  if (message.action === "summarizeText") {
    console.log("🧠 요약 요청 수신. 텍스트 길이:", message.text.length);

    fetch("http://localhost:5001/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.text })
    })
    .then(response => response.json())
    .then(data => {
      console.log("✅ 요약 응답 수신:", data.summary);
      sendResponse({ summary: data.summary });
    })
    .catch(error => {
      console.error("❌ 요약 서버 오류:", error);
      sendResponse({ summary: "요약 실패: " + error.message });
    });

    return true; // 비동기 응답을 위해 필수
  }

  if (message.action === "captionImage") {
    console.log("📸 이미지 캡션 요청 수신:", message);

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
      console.log("✅ 캡션 응답 수신:", data.caption);
      sendResponse({ caption: data.caption, summary: data.summary || null });
    })
    .catch(error => {
      console.error("❌ 캡션 서버 오류:", error);
      sendResponse({ caption: null, summary: null, error: error.message });
    });

    return true;
  }
});
