import { extractDOM } from "./getDOM.js"
import {GazeDB}  from "./indexedDB.js"
console.log("✅ popup.js 로드됨");
let db;

document.addEventListener("DOMContentLoaded", () => {
   db = new GazeDB("DOMDatabase", "domStore");
   db.openDB()
   })

document.getElementById("extractDom").addEventListener("click", () => {
    console.log("메세지 전송");
    const domData = extractDOM();
    db.save({ dom: domData });
    chrome.runtime.sendMessage({ action: "extractDom" , data: extractDOM()});

  });
