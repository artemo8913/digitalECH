/**
 * Общие данные по опорам, перегонам контактной сети. Содержат в себе
 * данные о перегонах/станциях, номера принадлежащим им опорам, даты проведения текущего ремонта с привязкой к опорам 
 * @typedef {Array<{"ЭЧК":string,
 * "Местоположение":string,
 * "Путь/съезд":string,
 * "Номер пути/съезда":string,
 * "Класс линии": string,
 * "Периодичность":number,
 * "Опора":string,
 * "Дата текущего ремонта":Date,
 * "Местоположение с номером пути":string}>} RailwaysDataTable
 */

/**
 * Группированные строки таблицы railwaysDataTable по "Местоположение с номером пути"
 * @typedef {{[locationWithWayNumber: string]: Array<{"ЭЧК": string,
 * "Пролет опор": string,
 * "Дата текущего ремонта": Date,
 * "Начало пролета": string,
 * "Конец пролета": string,
 * "Периодичность":number,
 * "Path":SVGElement}>}} GroupedByLocationData
 */

/**
 * Отгруппированные смежные пролеты опор с одинаковой датой ремонта из массива groupedByLocationData
 * @typedef {{"Местоположение с номером пути":{
 * "ЭЧК": string,
 * "Начало пролета": string,
 * "Конец пролета": string,
 * "Пролет опор": string,
 * "Дата текущего ремонта": Date,
 * "Периодичность":number,
 * "Длина участка": Number,
 * "Относительная длина": Number}[]}} GroupedByDateAndLocationData
 */

/**
 * Данные о выполненном текущем ремонте. Содержат в себе данные о местоположении, и диапазоне опор в которых проводился текущий ремонт
 * Местоположение;Путь/съезд;Номер пути/съезда;Пролет опор;Date
 * @typedef {Array<{
 * "ЭЧК": string,
 * "Местоположение":string,
 * "Путь/съезд":string,
 * "Номер пути/съезда":string,
 * "Пролет опор":string,
 * "Начало пролета": string,
 * "Конец пролета": string,
 * "Дата текущего ремонта":Date,
 * "Местоположение с номером пути":string,
 * "Ошибка":string}>} MaintenanceTable
 */


/**
 * Производим операции с данными текущего ремонта
 * @param {MaintenanceTable} maintenanceTable Распарсенные строки из таблицы maintenance
 * @param {GroupedByLocationData} groupedByLocationData
 */
function processMaintanceData(maintenanceTable, groupedByLocationData) {
    // Валидация данных
    maintenanceTable.forEach(data => {
        data["Ошибка"] = '';
        if (!data["ЭЧК"] || !data["Местоположение"] || !data["Дата текущего ремонта"] || !data["Пролет опор"] || !data["Путь/съезд"]) {
            data["Ошибка"] += "Строка с пустым полем; ";
            document.dispatchEvent(new CustomEvent("findError"));
            return;
        }
        //Убираем лишние символы
        if (!/^\d+[а-я]*-\d+[а-я]*$/gmi.test(data["Пролет опор"])) {
            data["Ошибка"] += "Неверный символ в пролете опор; ";
            document.dispatchEvent(new CustomEvent("findError"));
            return;
        }
        if (!(data["Дата текущего ремонта"] instanceof Date)) {
            data["Ошибка"] += "Неверный формат даты; ";
            document.dispatchEvent(new CustomEvent("findError"));
            return;
        }
        if (new Date(data["Дата текущего ремонта"]) > new Date()) {
            data["Ошибка"] += "Текущий ремонт выполнен в будущем времени; ";
            document.dispatchEvent(new CustomEvent("findError"));
            return;
        }
        //Уточняем местоположение опор        
        data["Местоположение с номером пути"] = data["Местоположение"] + data["Номер пути/съезда"];
        //Разбиваем диапазон опор в пределах которого проходил текущий ремонт на "начало" и "конец"
        [data["Начало пролета"], data["Конец пролета"]] = data["Пролет опор"].split("-");
        //Сортируем порядок опор в пролете опор
        if (parseInt(data["Начало пролета"]) > parseInt(data["Конец пролета"])) {
            [data["Начало пролета"], data["Конец пролета"]] = [data["Конец пролета"], data["Начало пролета"]];
        }
    });
    joinTables(maintenanceTable, groupedByLocationData);
}

/**
 * Производим операции с общими данными
 * @param {RailwaysDataTable} railwaysDataTable
 * @param {GroupedByLocationData} groupedByLocationData
 */
function processRailwaysData(railwaysDataTable, groupedByLocationData) {
    //Уточняем местоположение опор, сопоставляем указанный класс линии с периодичностью. Будет вынесено в изначальные данные
    railwaysDataTable.forEach(data => {
        data["Местоположение с номером пути"] = data["Местоположение"] + data["Номер пути/съезда"];
        //Устанавливаем периодичность
        if ((data["Класс линии"] == "1") || (data["Класс линии"] == "2")) {
            data["Периодичность"] = 2;
        }
        else if ((data["Класс линии"] == "3") || (data["Класс линии"] == "4")) {
            data["Периодичность"] = 6;
        }
        else if (data["Класс линии"] == "5") {
            data["Периодичность"] = 6;
        }

    });

    // Группируем массив из пролетов опор по "Местоположение с номером пути"
    for (let i = 0; i < (railwaysDataTable.length - 1); i++) {
        if (!groupedByLocationData[railwaysDataTable[i]["Местоположение с номером пути"]]) {
            let echk = railwaysDataTable[i]["ЭЧК"];
            let poleStart = railwaysDataTable[i]["Опора"];
            let poleEnd = railwaysDataTable[i + 1]["Опора"];
            let poleRange = `${railwaysDataTable[i]["Опора"]}-${railwaysDataTable[i + 1]["Опора"]}`;
            let periodicity = railwaysDataTable[i]["Периодичность"];
            groupedByLocationData[railwaysDataTable[i]["Местоположение с номером пути"]] = [{"ЭЧК":echk, "Пролет опор": poleRange, "Начало пролета": poleStart, "Конец пролета": poleEnd, "Дата текущего ремонта": "", "Периодичность": periodicity }];
        }
        else {
            if (railwaysDataTable[i]["Местоположение с номером пути"] == railwaysDataTable[i + 1]["Местоположение с номером пути"]) {
                let echk = railwaysDataTable[i]["ЭЧК"];
                let poleStart = railwaysDataTable[i]["Опора"];
                let poleEnd = railwaysDataTable[i + 1]["Опора"];
                let poleRange = `${railwaysDataTable[i]["Опора"]}-${railwaysDataTable[i + 1]["Опора"]}`;
                let periodicity = railwaysDataTable[i]["Периодичность"];
                groupedByLocationData[railwaysDataTable[i]["Местоположение с номером пути"]].push({"ЭЧК":echk, "Пролет опор": poleRange, "Начало пролета": poleStart, "Конец пролета": poleEnd, "Дата текущего ремонта": "", "Периодичность": periodicity });
            }
        }
    }
}
/**
 * Для каждой опоры в railwaysDataTable в пределах указанного диапазона указываем дату текущего ремонта
 * @param {MaintenanceTable} maintenanceTable 
 * @param {GroupedByLocationData} groupedByLocationData 
 */
function joinTables(maintenanceTable, groupedByLocationData) {
    maintenanceTable.forEach(maintenancedata => {
        for (const location in groupedByLocationData) {
            if (maintenancedata["Местоположение с номером пути"] == location) {
                let isCompare = false;
                if (isValidPoleInterval(maintenancedata, groupedByLocationData, location)) {
                    for (const sortdata of groupedByLocationData[location]) {
                        if (maintenancedata["Начало пролета"] === sortdata["Начало пролета"]) {
                            isCompare = true;
                        }
                        if (isCompare) {
                            if (new Date(maintenancedata["Дата текущего ремонта"]) > sortdata["Дата текущего ремонта"]) {
                                sortdata["Дата текущего ремонта"] = new Date(maintenancedata["Дата текущего ремонта"]);
                            }
                        }
                        if (isCompare && (maintenancedata["Конец пролета"] === sortdata["Конец пролета"])) {
                            isCompare = false;
                        }
                    }
                }

            }
        }
    });
}
/**
 * 
 */
function isValidPoleInterval(maintenancedata, groupedByLocationData, location) {
    let poleStartIsEquel = false;
    let poleEndIsEquel = false;
    const { "Начало пролета": start, "Конец пролета": end } = maintenancedata;

    if (maintenancedata["Ошибка"]) return false;

    for (const sortdata of groupedByLocationData[location]) {
        if (start === sortdata["Начало пролета"]) {
            poleStartIsEquel = true;
        }
        else if (String(parseInt(start)) === sortdata["Начало пролета"]) {
            document.dispatchEvent(new CustomEvent("findError"));
            maintenancedata["Ошибка"] += `№${start} нет в нормативном журнале, но есть №${sortdata["Начало пролета"]}; `;
        }
        if (end === sortdata["Конец пролета"]) {
            poleEndIsEquel = true;
        }
        else if (String(parseInt(end)) === sortdata["Конец пролета"]) {
            document.dispatchEvent(new CustomEvent("findError"));
            maintenancedata["Ошибка"] += `№${end} нет в нормативном журнале, но есть №${sortdata["Конец пролета"]}; `;
        }
    }
    if (!(poleStartIsEquel && poleEndIsEquel)) {
        document.dispatchEvent(new CustomEvent("findError"));
        maintenancedata["Ошибка"] += `начало (опора №${start} ${poleStartIsEquel}) или конец (опора №${end} ${poleEndIsEquel}) пролета опор не верны! У ${location} начало: ${groupedByLocationData[location][0]["Начало пролета"]} конец: ${groupedByLocationData[location][groupedByLocationData[location].length - 1]["Конец пролета"]}`;
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
                dateIsEqual = false;
                stack = [];
                groupedByDateAndLocationData[location] = [];
                poleStart = poleRangeData["Начало пролета"];
                poleEnd = poleRangeData["Конец пролета"];
                stack.push(poleRangeData);
                continue;
            }
            if (poleRangesData[i - 1]["Дата текущего ремонта"].toString() === poleRangesData[i]["Дата текущего ремонта"].toString()) {
                dateIsEqual = true;
                poleEnd = poleRangeData["Конец пролета"];
                stack.push(poleRangeData);
            }
            if (poleRangesData[i - 1]["Дата текущего ремонта"].toString() !== poleRangesData[i]["Дата текущего ремонта"].toString()) {
                dateIsEqual = false;
                groupedByDateAndLocationData[location].push({
                    "Начало пролета": poleStart,
                    "Конец пролета": poleEnd,
                    "Пролет опор": `${poleStart}-${poleEnd}`,
                    "Дата текущего ремонта": poleRangesData[i - 1]["Дата текущего ремонта"],
                    "Длина участка": stack.length,
                    "Относительная длина": stack.length / groupedByLocationData[location].length
                });
                poleStart = poleRangeData["Начало пролета"];
                poleEnd = poleRangeData["Конец пролета"];
                stack = [];
                stack.push(poleRangeData);
            }
            if (i === (groupedByLocationData[location].length - 1)) {
                groupedByDateAndLocationData[location].push({
                    "Начало пролета": poleStart,
                    "Конец пролета": poleEnd,
                    "Пролет опор": `${poleStart}-${poleEnd}`,
                    "Дата текущего ремонта": poleRangesData[i]["Дата текущего ремонта"],
                    "Длина участка": stack.length,
                    "Относительная длина": stack.length / groupedByLocationData[location].length
                });
            }
        }

    }

    return groupedByDateAndLocationData;
}