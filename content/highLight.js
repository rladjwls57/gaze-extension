// console.log("✅ highLight.js 로드됨");
// // === 설정 상수 ===
// const OVERLAY_DURATION = 100; // 0.1초
// const HIGHLIGHT_CLASS = "gaze-highlight-box";
// const GAZE_CURSOR_ID = "gaze-cursor";

// // === 전역 변수 ===
// let lastTarget = null;
// let hoverStartTime = null;


// // === 시선 추적용 빨간 점 생성 ===
// function createGazeCursor() {
//   let cursor = document.getElementById(GAZE_CURSOR_ID);
//   if (!cursor) {
//     cursor = document.createElement("div");
//     cursor.id = GAZE_CURSOR_ID;
//     Object.assign(cursor.style, {
//       position: "fixed",
//       width: "10px",
//       height: "10px",
//       backgroundColor: "red",
//       borderRadius: "50%",
//       pointerEvents: "none",
//       zIndex: 9999,
//       transform: "translate(-50%, -50%)",
//     });
//     document.body.appendChild(cursor);
//   }
//   return cursor;
// }

// // === 특정 요소 강조 (빨간 박스) ===
// function highlightElement(target) {
//   removeHighlight();
//   const rect = target.getBoundingClientRect();
//   const highlight = document.createElement("div");
//   highlight.className = HIGHLIGHT_CLASS;
//   Object.assign(highlight.style, {
//     position: "fixed",
//     top: `${rect.top}px`,
//     left: `${rect.left}px`,
//     width: `${rect.width}px`,
//     height: `${rect.height}px`,
//     backgroundColor: "rgba(255, 0, 0, 0.3)",
//     pointerEvents: "none",
//     zIndex: 9998
//   });
//   document.body.appendChild(highlight);
// }

// // === 강조 제거 ===
// function removeHighlight() {
//   document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach(el => el.remove());
// }

// // === 마우스 이동 감지 ===
// document.addEventListener("mousemove", (event) => {
//   const gazeCursor = createGazeCursor();
//   Object.assign(gazeCursor.style, {
//     left: `${event.clientX}px`,
//     top: `${event.clientY}px`,
//   });

//   const element = document.elementFromPoint(event.clientX, event.clientY);
//   if (!element || element === document.body || element === document.documentElement) {
//     lastTarget = null;
//     hoverStartTime = null;
//     removeHighlight();
//     return;
//   }

//   if (element !== lastTarget) {
//     lastTarget = element;
//     hoverStartTime = performance.now();
//     removeHighlight();
//     return;
//   }

//   const now = performance.now();
//   if (hoverStartTime && (now - hoverStartTime >= OVERLAY_DURATION)) {
//     highlightElement(element);
//   }
// });



