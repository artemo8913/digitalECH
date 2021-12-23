/**
 *  Информация о содержащихся в SVG схеме "локаций" (путей станций и перегонов) и соответствующих им тегов path
 * @type {{"Location with way number":{path:SVGGeometryElement,
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
 * @param {GroupedByDateAndLocationData} groupedByDateAndLocationData
 */
function svgProcessV2(svgSchemeTitles, groupedByDateAndLocationData) {
    Array.from(svgSchemeTitles).forEach(title => {
        if (elementIsPathLocation(title.innerHTML, groupedByDateAndLocationData)) {
            let locationSVG = title.innerHTML;
            let groupElement = title.parentElement;
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
                        svgPathsData[locationSVG] = pathConstructorV2(groupedByDateAndLocationData[locationSVG], svgPathData, groupElement, locationSVG);
                        pathElement.remove();
                    }
                }
            );
        }
    });
    console.log(svgPathsData);
}
/**
 * Формирование новых path элементов. Расчитывает координаты точек новых path
 * @param {{"Pole start": string,
 * "Pole end": string,
 * "Pole range": string,
 * "Date maintenance": Date,
 * "Periodicity":number,
 * "Pole ranges count": Number,
 * "Relative Length": Number}[]} poleRangesData
 * @param {{path:SVGGeometryElement,
 * dAttribute:string,
 * "Path points":{x:Number,y:Number}[]}} initialSvgPathData
 * @param {Element} groupElement
 * @param {string} location
 */
function pathConstructorV2(poleRangesData, initialSvgPathData, groupElement, location) {
    /**
     * Конец path участка. Начало одного участка - конец другого (кроме самого первого участка)
     * @type {{x,y}}
     */
    let endPos;
    let newSvgPathsData = [];
    let totalLength = initialSvgPathData["path"].getTotalLength();
    let partsLength = 0;
    poleRangesData.forEach(poleRangeData => {
        let newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let newPathPoints = [];
        let partLength = poleRangeData["Relative Length"] * totalLength;
        partsLength += partLength;
        endPos = initialSvgPathData["path"].getPointAtLength(partsLength);

        for (let i = 0; i < initialSvgPathData["Path points"].length;) {
            let initialPathPoint = initialSvgPathData["Path points"][i];
            if (endPos.x >= initialPathPoint.x) {
                newPathPoints.push(initialPathPoint);
                initialSvgPathData["Path points"].splice(0, 1);
            }
            else {
                newPathPoints.push(endPos);
                initialSvgPathData["Path points"].unshift(endPos);
                break;
            }
        }
        newPath.setAttribute("d", dConstructor(newPathPoints));
        newPath.setAttribute("class", "st1");
        newSvgPathsData.push({
            path: newPath,
            dAttribute: newPath.getAttribute("d"),
            "Path points": newPathPoints
        });
        colorLinesV2(poleRangeData, newPath);
        createNewPath(groupElement, newPath);
        infoWindowEvent(newPath, poleRangeData, location);
    });
    return newSvgPathsData;
}
function createNewPath(groupElement, newPath) {
    groupElement.appendChild(newPath);
}
/**
 * По массиву с точками x, y формирует атрубут "d" SVG элемента "path"
 * @param {{x:Number,y:Number}[]} pathPoints 
 * @returns {string} dAttribute
 */
function dConstructor(pathPoints) {
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
 * @param {{"Pole start": string,
 * "Pole end": string,
 * "Pole range": string,
 * "Date maintenance": Date,
 * "Periodicity":number,
 * "Pole ranges count": Number,
 * "Relative Length": Number}} poleRangeData
 * @param {SVGPathElement} newPath
 */
function colorLinesV2(poleRangeData, newPath) {
    let msInYear = 1000 * 60 * 60 * 24 * 365;
    const lastJobDate = poleRangeData["Date maintenance"];

    if (!lastJobDate) {
        // console.log(1);
        newPath.style.stroke = "#ff0000";
        return;
    }

    const jobAge = (new Date().getTime() - lastJobDate.getTime()) / msInYear;

    if (jobAge > poleRangeData["Periodicity"]) {
        // console.log(2);
        newPath.style.stroke = "#ff0000";
    }
    else if (jobAge > 6) {
        // console.log(3);
        newPath.style.stroke = "#ff0000";
    }
    else if (jobAge > 5) {
        // console.log(4);
        newPath.style.stroke = "#ae6842";
    }
    else if (jobAge > 4) {
        // console.log(5);
        newPath.style.stroke = "#4e6d56";
    }
    else if (jobAge > 3) {
        // console.log(6);
        newPath.style.stroke = "#38fcff";
    }
    else if (jobAge > 2) {
        // console.log(7);
        newPath.style.stroke = "#ff8700";
    }
    else if (jobAge > 1) {
        // console.log(8);
        newPath.style.stroke = "#F0FF00";
    }
    else if (jobAge > 0) {
        // console.log(9);
        newPath.style.stroke = "#00FF00";
    }
}
