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
        clearSVGToolTip(title);
    });
    console.log(svgPathsData);
    navigateTo(svgPathsData["Малиногорка1"][0]["path"]);
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
        let partLength = poleRangeData["Relative Length"] * totalLength;
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
        infoWindowEvent(newPath, poleRangeData, location);
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
 * @param {{"Pole start": string,
 * "Pole end": string,
 * "Pole range": string,
 * "Date maintenance": Date,
 * "Periodicity":number,
 * "Pole ranges count": Number,
 * "Relative Length": Number}[]} poleRangesData
 * @param {Array<{path:SVGGeometryElement,
 * dAttribute:string,
 * "Path points":{x:Number,y:Number}[]}>} svgPathsData
 */
function createMarksOnPath(poleRangesData, svgPathsData) {
    poleRangesData.forEach((poleRangeData, index) => {
        const svgOnePathData = svgPathsData[index];
        const pathPoints = svgOnePathData["Path points"];
        const pathElement = svgOnePathData.path;

        const firstPathPoint = pathPoints[0];
        const lastPathPoint = pathPoints[pathPoints.length - 1];
        const markPathPoints = [];
        const markOffset = 5;
        markPathPoints.push({ x: lastPathPoint.x, y: (lastPathPoint.y + markOffset) });
        markPathPoints.push({ x: lastPathPoint.x, y: (lastPathPoint.y - markOffset) });

        const poleStart = poleRangeData["Pole start"];
        const poleEnd = poleRangeData["Pole end"];

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("class", "poleMarkText");
        text.setAttribute("x", lastPathPoint.x.toString());
        text.setAttribute("y", (lastPathPoint.y - markOffset).toString());
        text.innerHTML = poleEnd;

        const svgMark = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svgMark.setAttribute("class", "poleSvgMark");
        svgMark.setAttribute("d", dAttributeConstructor(markPathPoints));

        pathElement.parentElement.appendChild(text);
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
//	<animate attributeName="width" from="336.287in" to="0" begin="2s" dur="10s" />
/**
 * Установить масштаб SVG документа
 * @param {HTMLElement} svgContainer DIV контейнер с SVG объектом
 * @param {SVGSVGElement} svgElement
 * @param {Number} scale масштаб приближения/отдаления
 * @param {Boolean} smooth плавное масштабирование
 */
function svgScale(svgContainer, svgElement, scale, smooth = false) {
    if (smooth) {
        const svgWHstart = {
            width: Number(svgElement.width.baseVal.value),
            height: Number(svgElement.height.baseVal.value)
        };
        const svgWHend = {
            width: svgWHstart.width * scale,
            height: svgWHstart.height * scale
        };
        const animationDuration_ms = 1000;
        const fps = 10;
        const frameTime_ms = 1000 / fps;
        const framesAmount = animationDuration_ms / frameTime_ms;
        const svgWHdelta = {
            width: (svgWHend.width - svgWHstart.width) / framesAmount,
            height: (svgWHend.height - svgWHstart.height) / framesAmount
        };
        const scaleDelta = 0.01;
        requestAnimationFrame(()=>chanageSvgWH(svgElement, svgWHdelta, svgWHend,scaleDelta));
        // const timer = window.setInterval(chanageSvgWH, frameTime_ms, svgElement, svgWHdelta);
        // window.setTimeout(() => {
        //     window.clearInterval(timer);
        // }, animationDuration_ms);

    }
    else {
        const svgWidth = Number(svgElement.width.baseVal.value) * scale;
        const svgHeight = Number(svgElement.height.baseVal.value) * scale;
        svgElement.setAttribute("height", svgHeight.toString());
        svgElement.setAttribute("width", svgWidth.toString());
        svgContainer.scrollTop *= scale;
        svgContainer.scrollLeft *= scale;
    }
}
/**
 * 
 * @param {SVGSVGElement} svgElement
 * @param {{width: number, height: number}} svgWHdelta
 * @param {{width: number, height: number}} svgWHend
 */
function chanageSvgWH(svgElement, svgWHdelta, svgWHend, scaleDelta) {
    const svgWHstart = {
        width: Number(svgElement.width.baseVal.value),
        height: Number(svgElement.height.baseVal.value)
    };
    const svgWidth = svgWHstart.width + svgWHdelta.width;
    const svgHeight = svgWHstart.height + svgWHdelta.height;

    svgElement.transform.baseVal.getItem(0).matrix.a += scaleDelta;
    svgElement.transform.baseVal.getItem(0).matrix.d += scaleDelta;
    // svgElement.setAttribute("height", svgHeight.toString());
    // svgElement.setAttribute("width", svgWidth.toString());
    
    console.log(1);
    // if(svgWHend.width > svgWHstart.width){
    //     requestAnimationFrame(()=>chanageSvgWH(svgElement, svgWHdelta, svgWHend));
    // }
    if(2 > svgElement.transform.baseVal.getItem(0).matrix.a){
        requestAnimationFrame(()=>chanageSvgWH(svgElement, svgWHdelta, svgWHend, scaleDelta));
    }
}