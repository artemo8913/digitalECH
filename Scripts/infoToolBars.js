let infoWindow = document.getElementById("infoWindow");

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
        let infoWindow = document.getElementById("infoWindow");
        infoWindow.hidden = false;
        infoWindow.style.top = `${event.screenY}px`;
        infoWindow.style.left = `${event.screenX}px`;
        // console.log(infoWindow.parentElement.offsetWidth);
        // console.log(infoWindow.offsetWidth);
        // console.log(infoWindow.parentElement.offsetTop);

        // let infoWindowText = `Текущий ремонт ${location} оп.№${poleRangeData["Pole start"]}-${poleRangeData["Pole end"]} `;
        let infoWindowText = `Оп.№${poleRangeData["Pole start"]}-${poleRangeData["Pole end"]} `;
        if (poleRangeData["Date maintenance"].toString() === '') {
            infoWindowText += `тек. ремонт не выполнен`;
        }
        else {
            // infoWindowText += `выполнен ${poleRangeData["Date maintenance"].toLocaleDateString('ru-RU')}`;
            infoWindowText += `- ${poleRangeData["Date maintenance"].toLocaleDateString('ru-RU')}`;
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