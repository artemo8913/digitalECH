let infoWindow = document.getElementById("infoWindow");
let infoWindowContent;

/**
 * При наведении мыши на "path" элемент появляется информационное окна с данными о ТР
 * @param {SVGGeometryElement} path 
 * @param {{"Pole start": string;
 * "Pole end": string;
 * "Pole range": string;
 * "Date maintenance": Date;
 *  "Periodicity": number;
 * "Pole ranges count": number;
 * "Relative Length": number;
 * }}poleRangeData
 * @param {string} location
 * 
 */
function infoWindowEvent(path, poleRangeData,location) {
    path.addEventListener("mouseenter", event => {
        // console.log(event);
        let infoWindow = document.getElementById("infoWindow");
        infoWindow.hidden = false;
        infoWindow.style.marginTop = `${event.screenY-20}px`;
        infoWindow.style.marginLeft = `${event.screenX}px`;
        let infoWindowText = `Текущий ремонт ${location} оп.№${poleRangeData["Pole start"]}-${poleRangeData["Pole end"]} `;
        if (poleRangeData["Date maintenance"].toString() === '') {
            infoWindowText += `не выполнен`;
        }
        else {
            infoWindowText += `выполнен ${poleRangeData["Date maintenance"].toLocaleDateString('ru-RU')}`;
        }

        infoWindow.innerHTML = infoWindowText;
    });
    path.addEventListener("mouseleave", event => {
        // console.log(event);
        let infoWindow = document.getElementById("infoWindow");
        infoWindow.hidden = true;
    });
    return;
}