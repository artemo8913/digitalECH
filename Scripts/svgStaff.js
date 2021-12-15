const svgProcessBtn = document.getElementById("svgProcess");
svgProcessBtn.onclick = svgProcess;

const svgPathData = {};
/**
 * @type {HTMLObjectElement}
 */
//@ts-ignore
const obj = document.getElementById("svgDocument");
function svgProcess() {
    let svgDoc = obj.contentDocument;
    let titles = svgDoc.getElementsByTagName("title");

    Array.from(titles).forEach(title => {
        if (elementIsPathLocation(title.innerHTML)) {
            /**
             * @type {HTMLElement} parent
             */
            let groupElement = title.parentElement;
            let locationFromSVG = title.innerHTML;

            //@ts-ignore
            Array.from(groupElement.children).forEach(/** @param {SVGGeometryElement} pathElement */(pathElement) => {
                if (pathElement.tagName == "path") {
                    let startPos = pathElement.getPointAtLength(0);
                    let length = pathElement.getTotalLength();
                    let num = sortedGeneralData[locationFromSVG].length;
                    let pathBends = pathDesctructor(pathElement);
                    //Потом вынеси в отдельную проверку данных
                    if (groupElement.transform.baseVal.length == 2) {
                        console.log(`Скорее всего данный элемент перевернут: `);
                        console.log(groupElement);
                    }
                    if (startPos.x > pathElement.getPointAtLength(length).x) {
                        console.log(`Скорее всего данный элемент перевернут: `);
                        console.log(groupElement);
                    }
                    let partLength = length / num;
                    // console.log(element);
                    for (let counter = 0; counter < num; counter++) {
                        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        let endPos = pathElement.getPointAtLength(partLength);
                        path.setAttribute("d", pathConstructor(pathElement, startPos, endPos, partLength, pathBends));
                        startPos = endPos;
                        partLength += length / num;
                        path.setAttribute("class", "st1");
                        juxtaposeSvgPathandSortedGeneralData(sortedGeneralData, locationFromSVG, path);
                        groupElement.appendChild(path);
                        // console.log("partLength = " + partLength);
                        // console.log("length = " + length);
                        // console.log(partLength <= length);
                    }
                    pathElement.remove();
                }
            });
        }
    });
    pathUnite(sortedGeneralData);
};

// <path d="M0 841.89 L33.01 808.88 L255.12 808.88 L283.46 841.89" class="st1"/>}
function pathDesctructor(pathElement) {
    //Возвращает массив координат направлений отрезка "L". При наличии изгибов в svg возвращает массив из больше, чем одного элемента
    let pathBends = pathElement.getAttribute("d").split(" ").map((pathContent, index, pathValue) => {
        if (pathContent.startsWith("L")) {
            return { x: pathContent.substring(1), y: pathValue[index + 1] };
        }
    }).filter(u => u);
    return pathBends;
}

function pathConstructor(pathElement, startPos, endPos, partLength, pathBends) {
    let d = "";
    // console.log(pathElement);
    // console.log("\tpartLength =" + partLength +"\tpathBends" + JSON.stringify(pathBends));
    if (pathElement.getPointAtLength(partLength).x > pathBends[0].x) {
        d = `M${startPos.x} ${startPos.y} L${pathBends[0].x} ${pathBends[0].y} L${endPos.x} ${endPos.y}`
        pathBends.splice(0, 1);
    }
    else {
        d = `M${startPos.x} ${startPos.y} L${endPos.x} ${endPos.y}`;
    }
    // console.log("d = " + d + "\t");
    return d;
}

function pathUnite(sortedGeneralData) {
    let pathD = "";
    let indexUniteStart = 0;
    for (let location in sortedGeneralData) {
        for (let i = 0; i < sortedGeneralData[location].length; i++) {
            // console.log(sortedGeneralData[location][i]["Path"]);
            // console.log(sortedGeneralData[location][i]["Date maintenance"]);
            if (i === 0) {
                indexUniteStart = 0;
                pathD = sortedGeneralData[location][i]["Path"].getAttribute("d");
            }
            else if (sortedGeneralData[location][i]["Date maintenance"].toString() === sortedGeneralData[location][i - 1]["Date maintenance"].toString()) {
                pathD += sortedGeneralData[location][i]["Path"].getAttribute("d");
                sortedGeneralData[location][indexUniteStart]["Path"].setAttribute("d", pathD);
                sortedGeneralData[location][i]["Path"].remove();
            }
            else {
                indexUniteStart = i;
                pathD = sortedGeneralData[location][i]["Path"].getAttribute("d");
            }
        }
    }
}

function elementIsPathLocation(innerHTML) {
    for (const location in sortedGeneralData) {
        if (location == innerHTML) {
            return true;
        }
    }
    return false;
}
/**
 * 
 * @param {{"Pole range": string,
 * "Date maintenance": Date;
 * "Pole start": string,
 * "Pole end": string,
 * "Periodicity":number,
 * "Path":SVGElement}} objFromSortedGeneralData 
 * @param {SVGElement} path
 */
function colorLines(objFromSortedGeneralData, path) {
    let yearMultiplier = 1000 * 60 * 60 * 24 * 365;
    if (!objFromSortedGeneralData["Date maintenance"]) {
        // console.log(objFromSortedGeneralData);
        // console.log(1);
        path.style.stroke = "#ff0000";
    }
    //@ts-ignore
    else if (objFromSortedGeneralData["Date maintenance"] < (new Date(new Date() - yearMultiplier * objFromSortedGeneralData["Periodicity"]))) {
        // console.log(objFromSortedGeneralData);
        // console.log(2);
        path.style.stroke = "#ff0000";
    }
    //@ts-ignore
    else if (objFromSortedGeneralData["Date maintenance"] < (new Date(new Date() - yearMultiplier * 6))) {
        // console.log(objFromSortedGeneralData);
        // console.log(3);
        path.style.stroke = "#ff0000";
    }
    //@ts-ignore
    else if (objFromSortedGeneralData["Date maintenance"] < (new Date(new Date() - yearMultiplier * 5))) {
        // console.log(objFromSortedGeneralData);
        // console.log(4);
        path.style.stroke = "#ae6842";
    }
    //@ts-ignore
    else if (objFromSortedGeneralData["Date maintenance"] < (new Date(new Date() - yearMultiplier * 4))) {
        // console.log(objFromSortedGeneralData);
        // console.log(5);
        path.style.stroke = "#4e6d56";
    }
    //@ts-ignore
    else if (objFromSortedGeneralData["Date maintenance"] < (new Date(new Date() - yearMultiplier * 3))) {
        // console.log(objFromSortedGeneralData);
        // console.log(6);
        path.style.stroke = "#38fcff";
    }
    //@ts-ignore
    else if (objFromSortedGeneralData["Date maintenance"] < (new Date(new Date() - yearMultiplier * 2))) {
        // console.log(objFromSortedGeneralData);
        // console.log(7);
        path.style.stroke = "#ff8700";
    }
    //@ts-ignore
    else if (objFromSortedGeneralData["Date maintenance"] < (new Date(new Date() - yearMultiplier * 1))) {
        // console.log(objFromSortedGeneralData);
        // console.log(8);
        path.style.stroke = "#F0FF00";
    }
    else if (objFromSortedGeneralData["Date maintenance"] < new Date()) {
        // console.log(objFromSortedGeneralData);
        // console.log(9);
        path.style.stroke = "#00FF00";
    }
}
/**
 * 
 * @param {sortedGeneralData} sortedGeneralData
 * @param {SVGElement} path 
 * @param {string} locationFromSVG
 */
function juxtaposeSvgPathandSortedGeneralData(sortedGeneralData, locationFromSVG, path) {
    for (const locationFromData in sortedGeneralData) {
        if (locationFromData == locationFromSVG) {
            // console.log(locationFromData);
            // console.log(path);
            for (const data of sortedGeneralData[locationFromData]) {
                if (!data["Path"]) {
                    data["Path"] = path;
                    // console.log(data);
                    colorLines(data, path);
                    path.setAttribute("date", data["Date maintenance"]);
                    path.addEventListener("mouseenter", event => {
                        // console.log(event);
                        let infoWindow = document.getElementById("infoWindow");
                        infoWindow.hidden = false;
                        infoWindow.style.marginTop = `${event.screenY - 100}px`;
                        infoWindow.style.marginLeft = `${event.screenX - 60}px`;
                        let infoWindowText = `Текущий ремонт ${locationFromData} оп.№${data["Pole start"]}-${data["Pole end"]} `;
                        if (data["Date maintenance"] === '') {
                            infoWindowText += `не выполнен`;
                        }
                        else {
                            infoWindowText += `выполнен ${data["Date maintenance"].toLocaleDateString('ru-RU')}`;
                        }

                        infoWindow.innerHTML = infoWindowText;
                    });
                    path.addEventListener("mouseout", event => {
                        // console.log(event);
                        let infoWindow = document.getElementById("infoWindow");
                        infoWindow.hidden = true;
                    });
                    return;
                }
            }
        }
    }
}