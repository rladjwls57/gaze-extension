// console.log("✅ LLM.js 로드됨");
// // === 설정 상수 ===
// const SUMMARY_TRIGGER_COUNT = 10;



// class GazeDB {
//   constructor(dbName = "GazeDatabase", storeName = "gazeStore") {
//     this.dbName = dbName;
//     this.storeName = storeName;
//     this.dbVersion = 1;

//     this.stats = {
//       saveCount: 0,
//       startTime: Date.now()
//     };
//   }

//   async openDB() {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, this.dbVersion);
//       request.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         if (!db.objectStoreNames.contains(this.storeName)) {
//           db.createObjectStore(this.storeName, { keyPath: "timestamp" });
//         }
//       };
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async save(data) {
//     const db = await this.openDB();
//     const tx = db.transaction(this.storeName, "readwrite");
//     const store = tx.objectStore(this.storeName);
//     const payload = { ...data, timestamp: Date.now() };
//     store.add(payload);
//     this.stats.saveCount++;

//     return new Promise((resolve, reject) => {
//       tx.oncomplete = () => resolve(payload);
//       tx.onerror = () => reject(tx.error);
//     });
//   }

//   async getAll() {
//     const db = await this.openDB();
//     const tx = db.transaction(this.storeName, "readonly");
//     const store = tx.objectStore(this.storeName);
//     const request = store.getAll();

//     return new Promise((resolve, reject) => {
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async clear() {
//     const db = await this.openDB();
//     const tx = db.transaction(this.storeName, "readwrite");
//     const store = tx.objectStore(this.storeName);
//     store.clear();
//     return new Promise((resolve, reject) => {
//       tx.oncomplete = () => resolve();
//       tx.onerror = () => reject(tx.error);
//     });
//   }
// }

// const db = new GazeDB();

// // === LLM 요약 요청 ===
// function sendTextToLLM(textList) {
//   const prompt = textList.join("\n");

//   chrome.runtime.sendMessage({ action: "summarizeText", text: prompt }, (response) => {
//     if (chrome.runtime.lastError) {
//       console.error("❌ LLM 메시지 전송 실패:", chrome.runtime.lastError.message);
//     } else {
//       console.log("🧠 요약 결과:", response.summary);
//     }
//   });
// }

// // === 캡션 서버에 전송 ===
// async function captionImageUrlAndStore(imageUrl, originalDomData) {
//   const endpoint = "http://localhost:5001/caption-url";

//   try {
//     const response = await fetch(endpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ imageUrl })
//     });

//     const data = await response.json();
//     const caption = data.caption || data.error || "캡션 없음";

//     const fullData = { ...originalDomData, imageUrl, caption, timestamp: Date.now() };
//     await db.save(fullData);
//     console.log("📝 이미지 캡션 저장 완료:", caption);

//     await checkAndTriggerSummary();
//   } catch (err) {
//     console.error("❌ 이미지 캡셔닝 실패:", err);
//     await db.save({ ...originalDomData, imageUrl, caption: "캡셔닝 실패", timestamp: Date.now() });
//     await checkAndTriggerSummary();
//   }
// }

// // === DOM 요소 저장 및 캡셔닝 ===
// async function toindexedDB(e) {
//   e.preventDefault();
//   const target = e.target;
//   if (!target) return;

//   const domData = {
//     tagName: target.tagName,
//     id: target.id,
//     className: target.className,
//     innerText: target.innerText,
//     outerHTML: target.outerHTML,
//     dataset: { ...target.dataset },
//     timestamp: Date.now()
//   };

//   if (target.tagName.toLowerCase() === "img" && target.src) {
//     await captionImageUrlAndStore(target.src, domData);
//   } else {
//     const img = target.querySelector("img");
//     if (img && img.src) {
//       await captionImageUrlAndStore(img.src, domData);
//     } else {
//       await db.save(domData);
//       console.log("✅ 일반 DOM 요소 저장 완료");
//       await checkAndTriggerSummary();
//     }
//   }
// }

// // === 10개 이상 쌓이면 LLM 요약 요청 ===
// async function checkAndTriggerSummary() {
//   const all = await db.getAll();
//   if (all.length >= SUMMARY_TRIGGER_COUNT) {
//     const latest = all
//       .sort((a, b) => b.timestamp - a.timestamp)
//       .slice(0, SUMMARY_TRIGGER_COUNT);

//     const contents = latest.map(item => item.caption || item.innerText || "").filter(Boolean);
//     if (contents.length > 0) {
//       sendTextToLLM(contents);
//     } else {
//       console.warn("요약할 내용이 충분하지 않음.");
//     }
//   }
// }

// // === 이벤트 리스너 등록 ===
// document.addEventListener("contextmenu", toindexedDB);
