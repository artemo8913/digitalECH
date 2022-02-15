/** 
* @param {SVGElement} path
* @param {GroupedByLocationData} groupedByLocationData
* @param {{"Pole start": string,
* "Pole end": string,
* "Pole range": string,
* "Date maintenance": Date,
* "Periodicity":number,
* "Pole ranges count": Number,
* "Relative Length": Number}} poleRangeData
* @param {string} location 
*/
function infoWindowEvent(path, groupedByLocationData, poleRangeData, location) {
    const infoAsideWindow = document.getElementsByClassName("content__info-aside")[0];
    const infoLocation = document.getElementsByClassName("content__info-aside-location")[0];
    const infoRailwayNumber = document.getElementsByClassName("content__info-aside-railway-number")[0];
    const infoPoles = document.getElementsByClassName("content__info-aside-railway-poles")[0];
    const infoPoleRange = document.getElementsByClassName("content__info-aside-maintenance-pole-range")[0];
    const infoDate = document.getElementsByClassName("content__info-aside-maintenance-date")[0];
    /**
     * @type {{
     * locationText:string,
     * railwayNumberText:string,
     * polesText:string,
     * poleRangeText:string,
     * dateText:string}}
     *///@ts-ignore
    const maintenanceInfo = {};
    path.addEventListener("click", event => {
        infoAsideWindow.hidden = false;
        maintenanceInfo.locationText = location;
        maintenanceInfo.dateText = `${poleRangeData["Date maintenance"]}`;
        maintenanceInfo.poleRangeText = `Оп.№${poleRangeData["Pole start"]}-${poleRangeData["Pole end"]} `;
        maintenanceInfo.polesText = groupedByLocationData[location].map((poleRangeData,index) => {
            if(index === 0){
                return poleRangeData["Pole start"] +", " + poleRangeData["Pole end"];
            }
            return poleRangeData["Pole end"];
        }).join(", ");

        poleRangeData["Date maintenance"] ?
            maintenanceInfo.dateText = `${poleRangeData["Date maintenance"].toLocaleDateString('ru-RU')}` :
            maintenanceInfo.dateText = `нет данных о проведении текущего ремонта`;
        enterInfoText(infoLocation, maintenanceInfo.locationText);
        enterInfoText(infoPoleRange, maintenanceInfo.poleRangeText);
        enterInfoText(infoDate, maintenanceInfo.dateText);
        enterInfoText(infoPoles,maintenanceInfo.polesText);
    });
    return;
}

function enterInfoText(infoBar, infoText) {
    const infoBarChildrens = Array.from(infoBar.getElementsByTagName("p"));
    console.log(infoBarChildrens);
    if (infoBarChildrens.length !== 0) {
        infoBarChildrens[0].remove();
    }
    const paragraph = document.createElement("p");
    paragraph.innerHTML = infoText;
    infoBar.appendChild(paragraph);
}