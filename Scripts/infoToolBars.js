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
 *///.content__info-aside
function infoWindowEvent(path, poleRangeData, location) {
    path.addEventListener("click", event => {
        let infoAsideWindow = document.getElementsByClassName("content__info-aside")[0];
        infoAsideWindow.hidden = false;

        let infoWindowText = `Оп.№${poleRangeData["Pole start"]}-${poleRangeData["Pole end"]} `;
        if (poleRangeData["Date maintenance"].toString() === '') {
            infoWindowText += `тек. ремонт не выполнен`;
        }
        else {
            infoWindowText += `- ${poleRangeData["Date maintenance"].toLocaleDateString('ru-RU')}`;
        }

        infoAsideWindow.innerHTML = infoWindowText;
    });
    path.addEventListener("mouseleave", event => {
        let infoAsideWindow = document.getElementById("infoAsideWindow");
        infoAsideWindow.hidden = true;
    });
    return;
}