/**
 * Общие данные по опорам, перегонам контактной сети. Содержат в себе
 * данные о перегонах/станциях, номера принадлежащим им опорам, даты проведения текущего ремонта с привязкой к опорам 
 * @type {Array.<{"Location":string,
 * "Railway/waypoint":string,
 * "Railway/waypoint number":string,
 * "Line class":string,
 * "Periodicity":number,
 * "Pole":string,
 * "Date maintenance":Date,
 * "Location with way number":string}>}
 */
let generalData = [];
/**
 * Отсортированные объекты массива generalData по "Location with way number"
 * @type {{"Location with way number":{"Pole range": string,
 * "Date maintenance": Date;
 * "Pole start": string,
 * "Pole end": string,
 * "Periodicity":number,
 * "Path":SVGElement}[]}}
 */
//@ts-ignore
let sortedGeneralData = {};
/**
 * Данные о выполненном текущем ремонте. Содержат в себе данные о местоположении, и диапазоне опор в которых проводился текущий ремонт
 * Location;Railway/waypoint;Railway/waypoint number;Pole range;Date
 * @type {{"Location":string,
 * "Railway/waypoint":string,
 * "Railway/waypoint number":string,
 * "Pole range":string,
 * "Pole start": string,
 * "Pole end": string,
 * "Date maintenance":string,
 * "Location with way number":string}[]}
 */
let maintenanceData = [];
/**
 * Производим операции с данными текущего ремонта
 * @param {maintenanceData} maintenanceData 
 */
function processMaintanceData(maintenanceData) {
    maintenanceData.forEach(data => {
        //Уточняем местоположение опор        
        data["Location with way number"] = data["Location"] + data["Railway/waypoint number"];
        //Разбиваем диапазон опор в пределах которого проходил текущий ремонт на "начало" и "конец"
        data["Pole start"] = data["Pole range"].split("-")[0];
        data["Pole end"] = data["Pole range"].split("-")[1];
    });
    console.log(maintenanceData);
    juxtaposeData(maintenanceData, sortedGeneralData);
}

/**
 * Производим операции с общими данными
 * @param {generalData} generalData
 */
function processGeneralData(generalData) {
    //Уточняем местоположение опор, сопоставляем указанный класс линии с периодичностью.
    generalData.forEach(data => {
        data["Location with way number"] = data["Location"] + data["Railway/waypoint number"];
        //Устанавливаем периодичность
        if ((data["Line class"] == "1") || (data["Line class"] == "2")) {
            data["Periodicity"] = 2;
        }
        else if ((data["Line class"] == "3") || (data["Line class"] == "4")) {
            data["Periodicity"] = 6;
        }
        else if (data["Line class"] == "5") {
            data["Periodicity"] = 6;
        }

    });

    // Составляем отсортированный по "Location with way number" массив из пролетов опор
    for (let i = 0; i < (generalData.length - 1); i++) {
        if (!sortedGeneralData[generalData[i]["Location with way number"]]) {
            let poleStart = generalData[i]["Pole"];
            let poleEnd = generalData[i + 1]["Pole"];
            let poleRange = `${generalData[i]["Pole"]}-${generalData[i + 1]["Pole"]}`;
            let periodicity = generalData[i]["Periodicity"];
            sortedGeneralData[generalData[i]["Location with way number"]] = [{ "Pole range": poleRange, "Pole start": poleStart, "Pole end": poleEnd, "Date maintenance": "", "Periodicity": periodicity }];
        }
        else {
            if (generalData[i]["Location with way number"] == generalData[i + 1]["Location with way number"]) {
                let poleStart = generalData[i]["Pole"];
                let poleEnd = generalData[i + 1]["Pole"];
                let poleRange = `${generalData[i]["Pole"]}-${generalData[i + 1]["Pole"]}`;
                let periodicity = generalData[i]["Periodicity"];
                sortedGeneralData[generalData[i]["Location with way number"]].push({ "Pole range": poleRange, "Pole start": poleStart, "Pole end": poleEnd, "Date maintenance": "", "Periodicity": periodicity });
            }
        }
    }
    //Разбиваем каждый пролет опор "начало" и "конец"
    console.log(sortedGeneralData);
}
/**
 * Для каждой опоры "Pole" в generalData в пределах указанного диапазона указываем дату текущего ремонта
 * @param {maintenanceData} maintenanceData 
 * @param {sortedGeneralData} sortedGeneralData 
 */
function juxtaposeData(maintenanceData, sortedGeneralData) {
    maintenanceData.forEach(maintenancedata => {
        for (const location in sortedGeneralData) {
            // console.log(location);
            if (maintenancedata["Location with way number"] == location) {
                let isCompare = false;
                for (const poleRange of sortedGeneralData[location]) {
                    // console.log(poleRange);
                    if (maintenancedata["Pole start"] === poleRange["Pole start"]) {
                        isCompare = true;
                        // console.log(isCompare);
                    }
                    if(isCompare){
                        if (new Date(maintenancedata["Date maintenance"]) > poleRange["Date maintenance"]) {
                            poleRange["Date maintenance"] = new Date(maintenancedata["Date maintenance"]);
                        }
                    }
                    if (isCompare && (maintenancedata["Pole end"] === poleRange["Pole end"])) {
                        isCompare = false;
                        // console.log(isCompare);
                    }
                }
            }
        }
    })
    // console.log(sortedGeneralData);
}