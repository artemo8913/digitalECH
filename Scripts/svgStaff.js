/**
 * @type {HTMLObjectElement}
 */
//@ts-ignore
const obj = document.getElementById("svgDocument");
obj.addEventListener("load", function () {
    let svgDoc = obj.contentDocument;
    let node = svgDoc.getElementsByTagName("title");

    Array.from(node).forEach(element => {
        if (elementIsPathLocation(element.innerHTML)) {
            /**
             * @type {HTMLElement} parent
             */
            let groupElement = element.parentElement;
            let location = element.innerHTML;
            //@ts-ignore
            Array.from(groupElement.children).forEach(/** @param {SVGGeometryElement} pathElement */ (pathElement) => {
                if (pathElement.tagName == "path") {
                    let startPos = pathElement.getPointAtLength(0);
                    let length = pathElement.getTotalLength();
                    let num = poleRange[location];
                    let pathBends = pathDesctructor(pathElement);
                    for (let partLength = (length/num); partLength <= length; partLength+=(length/num)) {
                        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        let endPos = pathElement.getPointAtLength(partLength);
                        path.setAttribute("d", pathConstructor(pathElement, startPos, endPos, partLength, pathBends));
                        startPos = pathElement.getPointAtLength(partLength);
                        path.setAttribute("class", "st5");
                        groupElement.appendChild(path);
                    }

                    pathElement.remove();

                }
            });
        }
    }
    );
}, false);

// <path d="M0 841.89 L33.01 808.88 L255.12 808.88 L283.46 841.89" class="st1"/>}
function pathDesctructor(pathElement){
    //Возвращает массив координат направлений отрезка "L". При наличии изгибов в svg возвращает массив из больше, чем одного элемента
    let pathBends = pathElement.getAttribute("d").split(" ").map((pathContent, index, pathValue) => {
        if(pathContent.startsWith("L")){
            return {x:pathContent.substring(1), y:pathValue[index+1]};
        }
    }).filter(u => u);
    return pathBends;
}

function pathConstructor(pathElement, startPos, endPos, partLength, pathBends){
    let d = "";
    if(pathElement.getPointAtLength(partLength).x > pathBends[0].x){
        d = `M${startPos.x} ${startPos.y} L${pathBends[0].x} ${pathBends[0].y} L${endPos.x} ${endPos.y}`
        pathBends.splice(0,1);
    }
    else{
        d = `M${startPos.x} ${startPos.y} L${endPos.x} ${endPos.y}`;
    }
    console.log(d);
    return d;
}

function elementIsPathLocation(innerHTML){
    for (const location in poleRange) {
        if(location==innerHTML){
            return true;
        }
    }
    return false;
}