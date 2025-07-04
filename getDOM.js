console.log("✅ getDOM.js 로드됨");

    // tagName: target.tagName,
    // id: target.id,
    // className: target.className,
    // innerText: target.innerText,
    // outerHTML: target.outerHTML,
    // dataset: { ...target.dataset },
    // timestamp: Date.now()


    //어떤 요소를 추가해야할지 고민해야할 듯
function getDOMTree(element) {
    let rect = element.getBoundingClientRect();
    let obj = {
        tag: element.tagName,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        text: element.innerText || "",  // 추가!
        children: []
    };

    for (let child of element.children) {
        obj.children.push(getDOMTree(child));
    }

    return obj;
}


function removeTextDuplicates(domTree, seenTexts = new Set()) {
    if (!domTree) return null;

    const textKey = domTree.text?.trim();
    if (textKey && seenTexts.has(textKey)) {
        return null; // 중복된 텍스트 제거
    }

    if (textKey) {
        seenTexts.add(textKey);
    }

    const filteredChildren = domTree.children
        .map(child => removeTextDuplicates(child, seenTexts))
        .filter(child => child !== null);

    return { ...domTree, children: filteredChildren };
}


function filterVisibleElements(domTree) {
    let viewportTop = window.scrollY;
    let viewportBottom = viewportTop + window.innerHeight;
    
    let viewportLeft = window.scrollX;
    let viewportRight = viewportLeft + window.innerWidth;

    let minWidth = 10, minHeight = 10;
    let allowedTags = ["BODY","P", "SPAN", "H1", "H2", "BUTTON", "A", "IMG", "DIV", "INPUT", "TEXTAREA"];

    function traverse(node) {
        if (!node) return null;

        let { x, y, width, height, tag, children } = node;
        console.log(`🔍 체크 중: ${tag} (x: ${x}, y: ${y}, w: ${width}, h: ${height})`);

        if (
            (y + height < viewportTop || y > viewportBottom) ||
            (x + width < viewportLeft || x > viewportRight)
        ) {
            console.log(`❌ ${tag} 제거 (보이지 않음)`);
            return null;
        }

        if (width < minWidth || height < minHeight) {
            console.log(`❌ ${tag} 제거 (너무 작음)`);
            return null;
        }

        if (!allowedTags.includes(tag)) {
            console.log(`❌ ${tag} 제거 (허용되지 않은 태그)`);
            return null;
        }

        let filteredChildren = children
            .map(traverse)
            .filter(child => child !== null);

        console.log(`✅ 남은 요소: ${tag}`);
        return { tag, x, y, width, height, children: filteredChildren };
    }

    return traverse(domTree);
}


function extractDOM() {
    let domData = getDOMTree(document.body);
    domData=filterVisibleElements(domData);
    console.log("현재 페이지의 DOM 구조:", domData);
    return domData;
}

function downloadJson(data, filename = "dom.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractDom") {
    const dom = extractDOM(); // ← DOM 분석 함수
    downloadJson(dom, "dom.json"); // JSON 파일로 다운로드
    return true;
  }
});

