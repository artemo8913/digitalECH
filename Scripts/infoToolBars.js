const infoAsideWindow = document.getElementsByClassName("info-aside")[0];
const closeBtn = document.getElementsByClassName("info-aside__close-btn")[0];
closeBtn.addEventListener("click",()=>infoAsideWindow.hidden = true);

const infoLocation = document.getElementsByClassName("info-aside-body__text-location")[0];
const infoPoles = document.getElementsByClassName("info-aside-body__text-railway-poles")[0];
const infoPoleRange = document.getElementsByClassName("info-aside-body__text-maintenance-pole-range")[0];
const infoDate = document.getElementsByClassName("info-aside-body__text-maintenance-date")[0];

/** 
* @param {SVGElement} path
* @param {GroupedByLocationData} groupedByLocationData
* @param {{"Начало пролета": string,
* "Конец пролета": string,
* "Пролет опор": string,
* "Дата текущего ремонта": Date,
* "Периодичность":number,
* "Опора ranges count": Number,
* "Относительная длина": Number}} poleRangeData
* @param {string} Местоположение 
*/
function infoWindowEvent(path, groupedByLocationData, poleRangeData, Местоположение) {
    /**
     * @type {{
     * locationText:string,
     * polesText:string,
     * poleRangeText:string,
     * dateText:string}}
     *///@ts-ignore
    const maintenanceInfo = {};
    path.addEventListener("click", event => {
        infoAsideWindow.hidden = false;
        maintenanceInfo.locationText = Местоположение;
        maintenanceInfo.dateText = `${poleRangeData["Дата текущего ремонта"]}`;
        maintenanceInfo.poleRangeText = `Оп.№${poleRangeData["Начало пролета"]}-${poleRangeData["Конец пролета"]} `;
        maintenanceInfo.polesText = groupedByLocationData[Местоположение].map((poleRangeData,index) => {
            if(index === 0){
                return poleRangeData["Начало пролета"] +", " + poleRangeData["Конец пролета"];
            }
            return poleRangeData["Конец пролета"];
        }).join(", ");

        poleRangeData["Дата текущего ремонта"] ?
            maintenanceInfo.dateText = `${poleRangeData["Дата текущего ремонта"].toLocaleDateString('ru-RU')}` :
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
    if (infoBarChildrens.length !== 0) {
        infoBarChildrens[0].remove();
    }
    const paragraph = document.createElement("p");
    paragraph.innerHTML = infoText;
    infoBar.appendChild(paragraph);
}