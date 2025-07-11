console.log("✅ getDOM.js 로드됨");
// --------------------------
// 0. 실험용 옵션 사전 정의
// --------------------------
const domExtractOptions = {
  "default": {
    includeText: true,
    includeStyle: true,
    includeMeta: true,
    onlyVisible: false,
    removeDuplicateText: false
  },
  "noStyle_metaOnly": {
    includeText: true,
    includeStyle: false,
    includeMeta: true,
    onlyVisible: true,
    removeDuplicateText: false
  },
  "withStyle_noMeta": {
    includeText: true,
    includeStyle: true,
    includeMeta: false,
    onlyVisible: true,
    removeDuplicateText: false
  },
  "textOnly_allElements": {
    includeText: true,
    includeStyle: false,
    includeMeta: false,
    onlyVisible: false,
    removeDuplicateText: true
  }
};

function styleToText(style) {
  if (!style) return "";

  const descriptions = [];

  if (style.color) {
    descriptions.push(`글자색은 ${style.color}입니다.`);
  }

  if (style.backgroundColor) {
    if (style.backgroundColor === "rgba(0, 0, 0, 0)" || style.backgroundColor === "transparent") {
      descriptions.push("배경은 투명입니다.");
    } else {
      descriptions.push(`배경색은 ${style.backgroundColor}입니다.`);
    }
  }

  if (style.fontSize) {
    descriptions.push(`글씨 크기는 ${style.fontSize}입니다.`);
  }

  if (style.fontWeight) {
    const fwNum = parseInt(style.fontWeight);
    if (!isNaN(fwNum) && fwNum >= 700) {
      descriptions.push("글씨는 굵게 표시됩니다.");
    } else if (style.fontWeight === "bold") {
      descriptions.push("글씨는 굵게 표시됩니다.");
    } else {
      descriptions.push(`글씨 두께는 ${style.fontWeight}입니다.`);
    }
  }

  if (style.display) {
    descriptions.push(`표시 형식은 '${style.display}'입니다.`);
  }

  if (style.visibility) {
    if (style.visibility === "visible") {
      descriptions.push("요소는 보입니다.");
    } else {
      descriptions.push("요소는 숨겨져 있습니다.");
    }
  }

  if (style.opacity) {
    const op = parseFloat(style.opacity);
    if (!isNaN(op) && op < 1) {
      descriptions.push(`투명도는 ${style.opacity}입니다.`);
    } else {
      descriptions.push("투명하지 않습니다.");
    }
  }

  if (style.margin && style.margin !== "0px") {
    descriptions.push(`바깥 여백(margin)은 ${style.margin}입니다.`);
  }

  if (style.padding && style.padding !== "0px") {
    descriptions.push(`안쪽 여백(padding)은 ${style.padding}입니다.`);
  }

  if (style.border && !style.border.startsWith("0px")) {
    descriptions.push(`테두리는 '${style.border}'입니다.`);
  } else {
    descriptions.push("테두리는 없습니다.");
  }

  return descriptions.join(" ");
}

// --------------------------
// 1. DOM 트리 생성 함수
// --------------------------
function getDOMTree(element, depth = 0, path = "", options = {}) {
  const rect = element.getBoundingClientRect();
  const style = options.includeStyle ? getComputedStyle(element) : {};

  const classStr = typeof element.className === "string" ? element.className : "";
const currentPath = path
  ? `${path} > ${element.tagName}${element.id ? `#${element.id}` : ""}${classStr ? `.${classStr.split(" ").join(".")}` : ""}`
  : element.tagName;


  let obj = {
    tag: element.tagName,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    depth: depth,
    path: currentPath,
    children: []
  };

  if (options.includeText) {
    obj.text = element.innerText || "";
  }

  if (options.includeMeta) {
    obj.id = element.id || "";
    obj.className = element.className || "";
    obj.dataset = { ...element.dataset };
  }

  if (options.includeStyle) {
    obj.style = {
      color: style.color,
      backgroundColor: style.backgroundColor,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      margin: style.margin,
      padding: style.padding,
      border: style.border
    };
    obj.styleText = styleToText(obj.style);
  }

  for (let child of element.children) {
    obj.children.push(getDOMTree(child, depth + 1, currentPath, options));
  }

  return obj;
}

// --------------------------
// 2. 필터 & 정제 함수
// --------------------------
function removeTextDuplicates(domTree, seenTexts = new Set()) {
  if (!domTree) return null;
  const textKey = domTree.text?.trim();
  if (textKey && seenTexts.has(textKey)) return null;
  if (textKey) seenTexts.add(textKey);

  const filteredChildren = (domTree.children || [])
    .map(child => removeTextDuplicates(child, seenTexts))
    .filter(child => child !== null);

  return { ...domTree, children: filteredChildren };
}

function filterVisibleElements(domTree, allowedTags) {
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;
  const viewportLeft = window.scrollX;
  const viewportRight = viewportLeft + window.innerWidth;
  const minWidth = 10, minHeight = 10;

  function traverse(node) {
    if (!node) return null;
    let { x, y, width, height, tag, children } = node;

    if (
      (y + height < viewportTop || y > viewportBottom) ||
      (x + width < viewportLeft || x > viewportRight) ||
      width < minWidth || height < minHeight ||
      !allowedTags.includes(tag)
    ) {
      return null;
    }

    const filteredChildren = (children || [])
      .map(traverse)
      .filter(child => child !== null);

    return { ...node, children: filteredChildren };
  }

  return traverse(domTree);
}

// --------------------------
// 3. DOM 추출 with 옵션
// --------------------------
function extractDOM(options = {}) {
  let dom = getDOMTree(document.body, 0, "", options);

  if (options.onlyVisible) {
    dom = filterVisibleElements(dom, options.allowedTags || [
      "BODY", "P", "SPAN", "H1", "H2", "BUTTON", "A", "IMG", "DIV", "INPUT", "TEXTAREA"
    ]);
  }

  if (options.removeDuplicateText) {
    dom = removeTextDuplicates(dom);
  }

  return dom;
}

// --------------------------
// 4. 파일 저장
// --------------------------
function downloadJson(data, filename = "dom.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}



// --------------------------
// 6. 옵션별 추출 실행 함수
// --------------------------
function extractByOption(optionKey = "default") {
  const options = domExtractOptions[optionKey];

  if (!options) {
    console.error(`❌ 옵션 '${optionKey}'은(는) 존재하지 않습니다.`);
    return;
  }

  const dom = extractDOM(options);
  const hostname = window.location.hostname.replace(/\./g, "_");
  const filename = `${hostname}_${optionKey}.json`;

  downloadJson(dom, filename);
  console.log(`✅ 추출 완료: ${filename}`);
}

// --------------------------
// 7. 메시지로 실행할 수도 있음
// --------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getDomTreeData") {
    extractByOption("default");
    sendResponse({ status: "ok" });
    return true;
  }
});
