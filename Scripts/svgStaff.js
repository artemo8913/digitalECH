/**
 *  Информация о содержащихся в SVG схеме "локаций" (путей станций и перегонов) и соответствующих им тегов path
 * @type {{"Местоположение с номером пути":{path:SVGGeometryElement,
 * dAttribute:string,
 * "Path points":{x:Number,y:Number}[]}[]}}
 */
//@ts-ignore
const svgPathsData = {};

/**
 * Возвращает массив координат path по атрибуту "d". При наличии изгибов в svg возвращает массив из больше, чем двух элементов
 * @param {SVGGeometryElement} pathElement 
 * @returns {{x:Number,y:Number}[]} pathPoints
 */
function findPathPoints(pathElement) {
    let pathPoints = pathElement.getAttribute("d").split(" ").map((pathContent, index, pathValue) => {
        if (pathContent.startsWith("M") || pathContent.startsWith("L")) {
            return { x: Number(pathContent.substring(1)), y: Number(pathValue[index + 1]) };
        }
    }).filter(u => u);
    return pathPoints;
}

function elementIsPathLocation(innerHTML, groupedByDateAndLocationData) {
    for (const location in groupedByDateAndLocationData) {
        if (location == innerHTML) {
            return true;
        }
    }
    return false;
}

/**
 * Основная функция для обработки SVG схемы
 * Заполняет svgPathsData данными применительно к "локации" данные об SVG элементе (path), его атрибута "d",
 * точки построения SVG элемента
 * @param {HTMLCollectionOf<HTMLTitleElement>} svgSchemeTitles
 * @param {GroupedByLocationData} groupedByLocationData
 * @param {GroupedByDateAndLocationData} groupedByDateAndLocationData
 */
function svgProcessV2(svgSchemeTitles, groupedByLocationData, groupedByDateAndLocationData) {
    Array.from(svgSchemeTitles).forEach(title => {
        if (elementIsPathLocation(title.innerHTML, groupedByDateAndLocationData)) {
            let locationSVG = title.innerHTML;
            let groupElement = title.parentElement;
            groupElement.setAttribute("class", "groupPathStyle");
            svgPathsData[locationSVG] = [];
            Array.from(groupElement.children).forEach(
                /** @param {SVGGeometryElement} pathElement */
                //@ts-ignore
                pathElement => {
                    if (pathElement.tagName == "path") {
                        const svgPathData = {
                            path: pathElement,
                            dAttribute: pathElement.getAttribute("d"),
                            "Path points": findPathPoints(pathElement)
                        };
                        svgPathsData[locationSVG] = pathConstructorV2(groupedByLocationData, groupedByDateAndLocationData[locationSVG], svgPathData, groupElement, locationSVG);
                        pathElement.remove();
                    }
                }
            );
        }
        clearSVGToolTip(title);
    });
    console.log(svgPathsData);
}
/**
 * Формирование новых path элементов. Расчитывает координаты точек новых path
 * @param {{"Начало пролета": string,
 * "Конец пролета": string,
 * "Пролет опор": string,
 * "Дата текущего ремонта": Date,
 * "Периодичность":number,
 * "Длина участка": Number,
 * "Относительная длина": Number}[]} poleRangesData
 * @param {{path:SVGGeometryElement,
 * dAttribute:string,
 * "Path points":{x:Number,y:Number}[]}} initialSvgPathData
 * @param {Element} groupElement
 * @param {string} location
 * @param {GroupedByLocationData} groupedByLocationData
 */
function pathConstructorV2(groupedByLocationData,poleRangesData,initialSvgPathData,groupElement,location) {
    /**
     * Начало path участка. Начало одного участка - конец другого (кроме самого первого участка)
     * @type {{x,y}}
     */
    let startPos = initialSvgPathData["path"].getPointAtLength(0);
    /**
     * Конец path участка. Начало одного участка - конец другого (кроме самого первого участка)
     * @type {{x,y}}
     */
    let endPoint;
    let newSvgPathsData = [];
    let totalLength = initialSvgPathData["path"].getTotalLength();
    let partsLength = 0;
    poleRangesData.forEach(poleRangeData => {
        let newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let newPathPoints = [];
        let partLength = poleRangeData["Относительная длина"] * totalLength;
        partsLength += partLength;
        endPoint = initialSvgPathData["path"].getPointAtLength(partsLength);

        for (let i = 0; i < initialSvgPathData["Path points"].length;) {
            let initialPathPoint = initialSvgPathData["Path points"][i];
            if (endPoint.x >= initialPathPoint.x) {
                newPathPoints.push(initialPathPoint);
                initialSvgPathData["Path points"].splice(0, 1);
            }
            else {
                newPathPoints.push(endPoint);
                initialSvgPathData["Path points"].unshift(endPoint);
                break;
            }
        }
        newPath.setAttribute("d", dAttributeConstructor(newPathPoints));
        newPath.setAttribute("class", "pathStyle");
        newSvgPathsData.push({
            path: newPath,
            dAttribute: newPath.getAttribute("d"),
            "Path points": newPathPoints
        });
        colorLinesV2(poleRangeData, newPath);
        createNewPath(groupElement, newPath);
        infoWindowEvent(newPath, groupedByLocationData, poleRangeData, location);
    });
    createMarksOnPath(poleRangesData, newSvgPathsData);
    return newSvgPathsData;
}
/**
 * Для удаления стандартного для svg tooltip'а зменяет наименования тегов SVG схемы title на message
 * @param {HTMLElement} title
 */
function clearSVGToolTip(title) {
    const messageEl = document.createElement("message");
    messageEl.innerHTML = title.innerHTML;
    title.parentElement.insertBefore(messageEl, title);
    title.remove();

}
function createNewPath(groupElement, newPath) {
    groupElement.appendChild(newPath);
}
/**
 * Создать и разместить отметки границ пролетов опор (path элементе). Чтобы не захламлять схему множеством налегающих друг
 * на друга символов/отметок, отображаются отметки и подписываются номером только "конечная" опора из диапазона
 * @param {{"Начало пролета": string,
 * "Конец пролета": string,
 * "Пролет опор": string,
 * "Дата текущего ремонта": Date,
 * "Периодичность":number,
 * "Длина участка": Number,
 * "Относительная длина": Number}[]} poleRangesData
 * @param {Array<{path:SVGGeometryElement,
 * dAttribute:string,
 * "Path points":{x:Number,y:Number}[]}>} svgPathsData
 */
function createMarksOnPath(poleRangesData, svgPathsData) {
    let lastSvgMarkText;
    poleRangesData.forEach((poleRangeData, index) => {
        const svgOnePathData = svgPathsData[index];
        const pathPoints = svgOnePathData["Path points"];
        const pathElement = svgOnePathData.path;

        const lastPathPoint = pathPoints[pathPoints.length - 1];
        const markPathPoints = [];
        const markOffset = 5;
        markPathPoints.push({ x: lastPathPoint.x, y: (lastPathPoint.y + markOffset) });
        markPathPoints.push({ x: lastPathPoint.x, y: (lastPathPoint.y - markOffset) });

        const poleEnd = poleRangeData["Конец пролета"];

        const svgMarkText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        svgMarkText.setAttribute("class", "poleMarkText");
        svgMarkText.setAttribute("x", lastPathPoint.x.toString());
        svgMarkText.setAttribute("y", (lastPathPoint.y - markOffset).toString());
        svgMarkText.innerHTML = poleEnd;

        const svgMark = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svgMark.setAttribute("class", "poleSvgMark");
        svgMark.setAttribute("d", dAttributeConstructor(markPathPoints));
        svgMark.setAttribute("transform",`rotate(${findPathAngle(svgOnePathData)} ${lastPathPoint.x} ${lastPathPoint.y})`);
       
        if(index===0){
            lastSvgMarkText = svgMarkText; 
        }
        else if(lastSvgMarkText.getBBox().width < (Number(svgMarkText.getAttribute("x")) - Number(lastSvgMarkText.getAttribute("x")))){
            lastSvgMarkText = svgMarkText; 
        }
        else svgMarkText.setAttribute("visibility","hidden");
        
        pathElement.parentElement.appendChild(svgMarkText);
        pathElement.parentElement.appendChild(svgMark);
    })

}
/**
 * По массиву с точками x, y формирует атрубут "d" SVG элемента "path"
 * @param {{x:Number,y:Number}[]} pathPoints 
 * @returns {string} dAttribute
 */
function dAttributeConstructor(pathPoints) {
    let dAttribute = "";
    pathPoints.forEach((pathPoint, index) => {
        if (index === 0) {
            dAttribute += `M${pathPoint.x} ${pathPoint.y}`;
        }
        else {
            dAttribute += ` L${pathPoint.x} ${pathPoint.y}`
        }
    });
    return dAttribute;
}
function checkSVG() {

}
/**
 * @param {{"Начало пролета": string,
 * "Конец пролета": string,
 * "Пролет опор": string,
 * "Дата текущего ремонта": Date,
 * "Периодичность":number,
 * "Длина участка": Number,
 * "Относительная длина": Number}} poleRangeData
 * @param {SVGPathElement} newPath
 */
function colorLinesV2(poleRangeData, newPath) {
    let msInYear = 1000 * 60 * 60 * 24 * 365;
    const lastJobDate = poleRangeData["Дата текущего ремонта"];

    if (!lastJobDate) {
        newPath.style.stroke = "#ff0000";
        return;
    }

    const jobAge = (new Date().getTime() - lastJobDate.getTime()) / msInYear;

    if (jobAge > poleRangeData["Периодичность"]) {
        newPath.style.stroke = "#ff0000";
    }
    else if (jobAge > 6) {
        newPath.style.stroke = "#ff0000";
    }
    else if (jobAge > 5) {
        newPath.style.stroke = "#ae6842";
    }
    else if (jobAge > 4) {
        newPath.style.stroke = "#4e6d56";
    }
    else if (jobAge > 3) {
        newPath.style.stroke = "#38fcff";
    }
    else if (jobAge > 2) {
        newPath.style.stroke = "#ff8700";
    }
    else if (jobAge > 1) {
        newPath.style.stroke = "#F0FF00";
    }
    else if (jobAge > 0) {
        newPath.style.stroke = "#00FF00";
    }
}


/**
 * @param {SVGSVGElement} svgElement
 * @param {number} scale
 */
function changeSvgScale(svgElement, svgContainer, scale) {
    const svgWidth = Number(svgElement.width.baseVal.value) * scale;
    const svgHeight = Number(svgElement.height.baseVal.value) * scale;
    svgElement.setAttribute("height", svgHeight.toString());
    svgElement.setAttribute("width", svgWidth.toString());
    svgContainer.scrollTop *= scale;
    svgContainer.scrollLeft *= scale;
}
/**
 * Находит угол наклона svg path элемента
 * @param {{path:SVGGeometryElement,
 * dAttribute:string,
 * "Path points":{x:Number,y:Number}[]}} svgPathData 
 */
function findPathAngle(svgPathData){
    const lastPoint = svgPathData["Path points"][svgPathData["Path points"].length - 1];
    const beforeLastPont = svgPathData["Path points"][svgPathData["Path points"].length - 2];
    const arcToDegree = Math.PI / 180;
    const length = Math.sqrt((lastPoint.x - beforeLastPont.x)**2 + (lastPoint.y - beforeLastPont.y)**2);
    const angle = Math.asin( (lastPoint.y - beforeLastPont.y) / length);
    return angle / arcToDegree;
}