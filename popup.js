console.log("✅ popup.js 로드됨");
document.addEventListener("DOMContentLoaded", () => {
  const domButton = document.getElementById("extractDomBtn");
  domButton.addEventListener("click", () => {
    console.log("메세지 전송");
    chrome.runtime.sendMessage({ action: "extractDom" });

  });
})
