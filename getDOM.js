function getDOMTree(element) {
    let obj = {
        tag: element.tagName,
        x: element.getBoundingClientRect().x,
        y: element.getBoundingClientRect().y,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
        children: []
    };

    for (let child of element.children) {
        obj.children.push(getDOMTree(child));
    }

    return obj;
}

function extractDOM() {
    let domData = getDOMTree(document.body);
    domData=filterVisibleElements(domData);
    console.log("현재 페이지의 DOM 구조:", domData);
    return domData;
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


export {extractDOM}