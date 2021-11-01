const svgProcessBtn = document.getElementById("svgProcess");
svgProcessBtn.onclick = svgProcess;
/**
 * @type {HTMLObjectElement}
 */
//@ts-ignore
const obj = document.getElementById("svgDocument");
function svgProcess(){
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
                    let partLength = length / num;
                    let color = true;
                    // console.log(element);
                    // for (let partLength = (length/num), color = true; partLength <= length; partLength += (length/num)) {
                    for(let counter = 0; counter < num; counter++){ 
                        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        let endPos = pathElement.getPointAtLength(partLength);
                        path.setAttribute("d", pathConstructor(pathElement, startPos, endPos, partLength, pathBends));
                        startPos = endPos;
                        partLength += length / num;
                        // path.setAttribute("class", "st5");
                        if(color){
                            path.setAttribute("stroke", `#ff0000`);
                            color = false;
                        }
                        else{
                            path.setAttribute("stroke", `#00ff00`);
                            color = true;
                        }
                        groupElement.appendChild(path);
                        // console.log("partLength = " + partLength);
                        // console.log("length = " + length);
                        // console.log(partLength <= length);
                    }

                    pathElement.remove();

                }
            });
        }
    }
    );
};

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
    // console.log(pathElement);
    // console.log("\tpartLength =" + partLength +"\tpathBends" + JSON.stringify(pathBends));
    if(pathElement.getPointAtLength(partLength).x > pathBends[0].x){
        d = `M${startPos.x} ${startPos.y} L${pathBends[0].x} ${pathBends[0].y} L${endPos.x} ${endPos.y}`
        pathBends.splice(0,1);
    }
    else{
        d = `M${startPos.x} ${startPos.y} L${endPos.x} ${endPos.y}`;
    }
    // console.log("d = " + d + "\t");
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