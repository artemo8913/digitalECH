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
 * "Date maintenance": Date,
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
    maintenanceData = maintenanceData.filter(data => {
        // console.log(data);
        if (data["Location"] === "") {
            console.log("Удалена строка с пустым значением локации!" + JSON.stringify(data));
            return false;
        }
        //Проверка на пробелы (лучше сделать проверку на символы, которых быть вообще не должно!)
        if (data["Date maintenance"].split(" ").length > 1) {
            data["Date maintenance"] = data["Date maintenance"].split(" ").join("");
            // console.log(data["Date maintenance"]);
            console.log("Найдена строка с косячным символом (не цифра, не точка). Лишние символы удалены" + JSON.stringify(data));
        }
        //Меняем дату и месяц местами
        let dateReverse = data["Date maintenance"].split(".");
        data["Date maintenance"] = `${dateReverse[1]}.${dateReverse[0]}.${dateReverse[2]}`

        if (new Date(data["Date maintenance"]) > new Date()) {
            console.log("Удалена строка с датой текущего ремонта из будущего!" + JSON.stringify(data));
            return false;
        }
        return true;
    });
    maintenanceData.forEach(data => {
        // console.log(data);
        //Уточняем местоположение опор        
        data["Location with way number"] = data["Location"] + data["Railway/waypoint number"];
        //Убираем лишние символы
        if (data["Pole range"].split(" ").length > 1) {
            data["Pole range"] = data["Pole range"].split(" ").join("");
            console.log("Найдена строка с косячным символом (не цифра и не тире) в пролете опор. Лишние символы удалены" + JSON.stringify(data));
        }
        //Разбиваем диапазон опор в пределах которого проходил текущий ремонт на "начало" и "конец"
        data["Pole start"] = data["Pole range"].split("-")[0];
        data["Pole end"] = data["Pole range"].split("-")[1];
        //Проверка на значения начальной и конечных опор
        if (parseInt(data["Pole start"]) > parseInt(data["Pole end"])) {
            [data["Pole start"], data["Pole end"]] = [data["Pole end"], data["Pole start"]];
        }
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
                if (canComapre(maintenancedata, sortedGeneralData, location)) {
                    for (const sortdata of sortedGeneralData[location]) {
                        // console.log(sortdata);
                        // console.log(poleRange);
                        if (maintenancedata["Pole start"] === sortdata["Pole start"]) {
                            isCompare = true;
                            // console.log(isCompare);
                        }
                        if (isCompare) {
                            if (new Date(maintenancedata["Date maintenance"]) > sortdata["Date maintenance"]) {
                                sortdata["Date maintenance"] = new Date(maintenancedata["Date maintenance"]);
                            }
                        }
                        if (isCompare && (maintenancedata["Pole end"] === sortdata["Pole end"])) {
                            isCompare = false;
                            // console.log(isCompare);
                        }
                    }
                }

            }
        }
    })
    console.log(sortedGeneralData);
}
/**
 * 
 */
function canComapre(maintenancedata, sortedGeneralData, location) {
    let poleStartIsEquel = false;
    let poleEndIsEquel = false;
    for (const sortdata of sortedGeneralData[location]) {
        if (maintenancedata["Pole start"] === sortdata["Pole start"]) {
            poleStartIsEquel = true;
        }
        else if (String(parseInt(maintenancedata["Pole start"])) === sortdata["Pole start"]) {
            poleStartIsEquel = true;
            console.log(`В диапазоне опор №${maintenancedata["Pole start"]}-${maintenancedata["Pole end"]} текущего ремонта ${location} в сутках ${maintenancedata["Date maintenance"]} содержится номер опоры, которого нет в нормативном журнале! Скорее всего имелся ввиду номер опоры №${sortdata["Pole start"]}`);
        }
        if (maintenancedata["Pole end"] === sortdata["Pole end"]) {
            poleEndIsEquel = true;
        }
        else if (String(parseInt(maintenancedata["Pole end"])) === sortdata["Pole end"]) {
            poleEndIsEquel = true;
            console.log(`В диапазоне опор №${maintenancedata["Pole start"]}-${maintenancedata["Pole end"]} текущего ремонта ${location} в сутках ${maintenancedata["Date maintenance"]} содержится номер опоры, которого нет в нормативном журнале! Скорее всего имелся ввиду номер опоры №${sortdata["Pole end"]}`);
        }
    }
    if (!(poleStartIsEquel && poleEndIsEquel)) {
        console.log(`Начало (опора №${maintenancedata["Pole start"]} ${poleStartIsEquel}) или конец (опора №${maintenancedata["Pole end"]} ${poleEndIsEquel}) пролета опор проведенного текущего ремонта ${location} в сутках ${maintenancedata["Date maintenance"]} не верны! Так, у ${location} начало: ${sortedGeneralData[location][0]["Pole start"]} и конец ${sortedGeneralData[location][sortedGeneralData[location].length - 1]["Pole end"]}`);
    }
    return (poleStartIsEquel && poleEndIsEquel);
}