/**
 * Общие данные по опорам, перегонам контактной сети. Содержат в себе
 * данные о перегонах/станциях, номера принадлежащим им опорам, даты проведения текущего ремонта с привязкой к опорам 
 * @typedef {Array<{"Location":string,
 * "Railway/waypoint":string,
 * "Railway/waypoint number":string,
 * "Line class":string,
 * "Periodicity":number,
 * "Pole":string,
 * "Date maintenance":Date,
 * "Location with way number":string}>} RailwaysDataTable
 */

/**
 * Группированные строки таблицы railwaysDataTable по "Location with way number"
 * @typedef {{[locationWithWayNumber: string]: Array<{"Pole range": string,
 * "Date maintenance": Date,
 * "Pole start": string,
 * "Pole end": string,
 * "Periodicity":number,
 * "Path":SVGElement}>}} GroupedByLocationData
 */

/**
 * Отгруппированные смежные пролеты опор с одинаковой датой ремонта из массива groupedByLocationData
 * @typedef {{"Location with way number":{
 * "Pole start": string,
 * "Pole end": string,
 * "Pole range": string,
 * "Date maintenance": Date,
 * "Periodicity":number,
 * "Pole ranges count": Number,
 * "Relative Length": Number}[]}} GroupedByDateAndLocationData
 */

/**
 * Данные о выполненном текущем ремонте. Содержат в себе данные о местоположении, и диапазоне опор в которых проводился текущий ремонт
 * Location;Railway/waypoint;Railway/waypoint number;Pole range;Date
 * @typedef {Array<{
 * "Location":string,
 * "Railway/waypoint":string,
 * "Railway/waypoint number":string,
 * "Pole range":string,
 * "Pole start": string,
 * "Pole end": string,
 * "Date maintenance":string,
 * "Location with way number":string}>} MaintenanceTable
 */

function filterInPlace(a, condition) {
    let i = 0, j = 0;

    while (i < a.length) {
        const val = a[i];
        if (condition(val, i, a)) { a[j++] = val; }
        i++;
    }

    a.length = j;
    return a;
}

/**
 * Производим операции с данными текущего ремонта
 * @param {MaintenanceTable} maintenanceTable Распарсенные строки из таблицы maintenance
 * @param {GroupedByLocationData} groupedByLocationData
 */
function processMaintanceData(maintenanceTable, groupedByLocationData) {
    // Валидация данных
    filterInPlace(maintenanceTable, data => {
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

        //Убираем лишние символы
        if (data["Pole range"].split(" ").length > 1) {
            data["Pole range"] = data["Pole range"].split(" ").join("");
            console.log("Найдена строка с косячным символом (не цифра и не тире) в пролете опор. Лишние символы удалены" + JSON.stringify(data));
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

    maintenanceTable.forEach(data => {
        // console.log(data);
        //Уточняем местоположение опор        
        data["Location with way number"] = data["Location"] + data["Railway/waypoint number"];

        //Разбиваем диапазон опор в пределах которого проходил текущий ремонт на "начало" и "конец"
        [data["Pole start"], data["Pole end"]] = data["Pole range"].split("-");

        //Проверка на значения начальной и конечных опор
        if (parseInt(data["Pole start"]) > parseInt(data["Pole end"])) {
            [data["Pole start"], data["Pole end"]] = [data["Pole end"], data["Pole start"]];
        }
    });

    console.log(maintenanceTable);
    joinTables(maintenanceTable, groupedByLocationData);
}

/**
 * Производим операции с общими данными
 * @param {RailwaysDataTable} railwaysDataTable
 * @param {GroupedByLocationData} groupedByLocationData
 */
function processRailwaysData(railwaysDataTable, groupedByLocationData) {
    //Уточняем местоположение опор, сопоставляем указанный класс линии с периодичностью.
    railwaysDataTable.forEach(data => {
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

    // Группируем массив из пролетов опор по "Location with way number"
    for (let i = 0; i < (railwaysDataTable.length - 1); i++) {
        if (!groupedByLocationData[railwaysDataTable[i]["Location with way number"]]) {
            let poleStart = railwaysDataTable[i]["Pole"];
            let poleEnd = railwaysDataTable[i + 1]["Pole"];
            let poleRange = `${railwaysDataTable[i]["Pole"]}-${railwaysDataTable[i + 1]["Pole"]}`;
            let periodicity = railwaysDataTable[i]["Periodicity"];
            groupedByLocationData[railwaysDataTable[i]["Location with way number"]] = [{ "Pole range": poleRange, "Pole start": poleStart, "Pole end": poleEnd, "Date maintenance": "", "Periodicity": periodicity }];
        }
        else {
            if (railwaysDataTable[i]["Location with way number"] == railwaysDataTable[i + 1]["Location with way number"]) {
                let poleStart = railwaysDataTable[i]["Pole"];
                let poleEnd = railwaysDataTable[i + 1]["Pole"];
                let poleRange = `${railwaysDataTable[i]["Pole"]}-${railwaysDataTable[i + 1]["Pole"]}`;
                let periodicity = railwaysDataTable[i]["Periodicity"];
                groupedByLocationData[railwaysDataTable[i]["Location with way number"]].push({ "Pole range": poleRange, "Pole start": poleStart, "Pole end": poleEnd, "Date maintenance": "", "Periodicity": periodicity });
            }
        }
    }
}
/**
 * Для каждой опоры "Pole" в railwaysDataTable в пределах указанного диапазона указываем дату текущего ремонта
 * @param {MaintenanceTable} maintenanceTable 
 * @param {GroupedByLocationData} groupedByLocationData 
 */
function joinTables(maintenanceTable, groupedByLocationData) {
    maintenanceTable.forEach(maintenancedata => {
        for (const location in groupedByLocationData) {
            // console.log(location);
            if (maintenancedata["Location with way number"] == location) {
                let isCompare = false;
                if (isValidPoleInterval(maintenancedata, groupedByLocationData, location)) {
                    for (const sortdata of groupedByLocationData[location]) {
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
}
/**
 * 
 */
function isValidPoleInterval(maintenancedata, groupedByLocationData, location) {
    let poleStartIsEquel = false;
    let poleEndIsEquel = false;
    const { "Pole start": start, "Pole end": end } = maintenancedata;

    for (const sortdata of groupedByLocationData[location]) {
        if (start === sortdata["Pole start"]) {
            poleStartIsEquel = true;
        }
        else if (String(parseInt(start)) === sortdata["Pole start"]) {
            poleStartIsEquel = true;
            console.log(`В диапазоне опор №${start}-${end} текущего ремонта ${location} в сутках ${maintenancedata["Date maintenance"]} содержится номер опоры, которого нет в нормативном журнале! Скорее всего имелся ввиду номер опоры №${sortdata["Pole start"]}`);
        }
        if (end === sortdata["Pole end"]) {
            poleEndIsEquel = true;
        }
        else if (String(parseInt(end)) === sortdata["Pole end"]) {
            poleEndIsEquel = true;
            console.log(`В диапазоне опор №${start}-${end} текущего ремонта ${location} в сутках ${maintenancedata["Date maintenance"]} содержится номер опоры, которого нет в нормативном журнале! Скорее всего имелся ввиду номер опоры №${sortdata["Pole end"]}`);
        }
    }
    if (!(poleStartIsEquel && poleEndIsEquel)) {
        console.log(`Начало (опора №${start} ${poleStartIsEquel}) или конец (опора №${end} ${poleEndIsEquel}) пролета опор проведенного текущего ремонта ${location} в сутках ${maintenancedata["Date maintenance"]} не верны! Так, у ${location} начало: ${groupedByLocationData[location][0]["Pole start"]} и конец ${groupedByLocationData[location][groupedByLocationData[location].length - 1]["Pole end"]}`);
    }
    return (poleStartIsEquel && poleEndIsEquel);
}
/**
 * Формирование данных для каждой "локации" о смежных пролетах опор с одинаковой датой текущего ремонта, содержащих
 * в том числе: начало и конец пролета опор, дату текущего ремонта, кол-во одиночных пролетов,
 * соотношение кол-во данного пролета опор к общему количеству пролетов на участке
 * @param {GroupedByLocationData} groupedByLocationData
 * @returns {GroupedByDateAndLocationData}
 */
function groupRailwaysDataByDate(groupedByLocationData) {
    let poleStart = "";
    let poleEnd = "";
    let stack = [];
    let dateIsEqual = false;

    /** @type {GroupedByDateAndLocationData} */
    //@ts-ignore
    const groupedByDateAndLocationData = {};

    for (let location in groupedByLocationData) {
        let poleRangesData = groupedByLocationData[location];
        groupedByDateAndLocationData[location] = [];
        for (let i = 0; i < groupedByLocationData[location].length; i++) {
            let poleRangeData = groupedByLocationData[location][i];
            if (i === 0) {
                // console.log(0);
                dateIsEqual = false;
                stack = [];
                groupedByDateAndLocationData[location] = [];
                poleStart = poleRangeData["Pole start"];
                poleEnd = poleRangeData["Pole end"];
                stack.push(poleRangeData);
                continue;
            }
            if (poleRangesData[i - 1]["Date maintenance"].toString() === poleRangesData[i]["Date maintenance"].toString()) {
                dateIsEqual = true;
                poleEnd = poleRangeData["Pole end"];
                stack.push(poleRangeData);
                // console.log("Выполняется условие");

            }
            if (poleRangesData[i - 1]["Date maintenance"].toString() !== poleRangesData[i]["Date maintenance"].toString()) {
                dateIsEqual = false;
                groupedByDateAndLocationData[location].push({
                    "Pole start": poleStart,
                    "Pole end": poleEnd,
                    "Pole range": `${poleStart}-${poleEnd}`,
                    "Date maintenance": poleRangesData[i-1]["Date maintenance"],
                    "Pole ranges count": stack.length,
                    "Relative Length": stack.length / groupedByLocationData[location].length
                });
                poleStart = poleRangeData["Pole start"];
                poleEnd = poleRangeData["Pole end"];
                stack = [];
                stack.push(poleRangeData);
                // console.log("Не выполняется условие");

            }
            if (i === (groupedByLocationData[location].length - 1)) {
                groupedByDateAndLocationData[location].push({
                    "Pole start": poleStart,
                    "Pole end": poleEnd,
                    "Pole range": `${poleStart}-${poleEnd}`,
                    "Date maintenance": poleRangesData[i]["Date maintenance"],
                    "Pole ranges count": stack.length,
                    "Relative Length": stack.length / groupedByLocationData[location].length
                });
            }
        }

    }

    return groupedByDateAndLocationData;
}