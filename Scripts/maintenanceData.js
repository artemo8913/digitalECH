/**
 * Общие данные по опорам, перегонам контактной сети. Содержат в себе
 * данные о перегонах/станциях, номера принадлежащим им опорам, даты проведения текущего ремонта с привязкой к опорам 
 * @typedef {Array<{"Местоположение":string,
 * "Путь/съезд":string,
 * "Номер пути/съезда":string,
 * "Класс линии":string,
 * "Периодичность":number,
 * "Опора":string,
 * "Дата текущего ремонта":Date,
 * "Местоположение с номером пути":string}>} RailwaysDataTable
 */

/**
 * Группированные строки таблицы railwaysDataTable по "Местоположение с номером пути"
 * @typedef {{[locationWithWayNumber: string]: Array<{"Пролет опор": string,
 * "Дата текущего ремонта": Date,
 * "Начало пролета": string,
 * "Конец пролета": string,
 * "Периодичность":number,
 * "Path":SVGElement}>}} GroupedByLocationData
 */

/**
 * Отгруппированные смежные пролеты опор с одинаковой датой ремонта из массива groupedByLocationData
 * @typedef {{"Местоположение с номером пути":{
 * "Начало пролета": string,
 * "Конец пролета": string,
 * "Пролет опор": string,
 * "Дата текущего ремонта": Date,
 * "Периодичность":number,
 * "Опора ranges count": Number,
 * "Относительная длина": Number}[]}} GroupedByDateAndLocationData
 */

/**
 * Данные о выполненном текущем ремонте. Содержат в себе данные о местоположении, и диапазоне опор в которых проводился текущий ремонт
 * Местоположение;Путь/съезд;Номер пути/съезда;Пролет опор;Date
 * @typedef {Array<{
 * "Местоположение":string,
 * "Путь/съезд":string,
 * "Номер пути/съезда":string,
 * "Пролет опор":string,
 * "Начало пролета": string,
 * "Конец пролета": string,
 * "Дата текущего ремонта":string,
 * "Местоположение с номером пути":string}>} MaintenanceTable
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
    console.log(maintenanceTable.length);
    // Валидация данных
    filterInPlace(maintenanceTable, data => {
        if (data["Местоположение"] === "") {
            console.log("Удалена строка с пустым значением локации!" + JSON.stringify(data));
            return false;
        }
        //Убираем лишние символы
        if (data["Пролет опор"].split(" ").length > 1) {
            data["Пролет опор"] = data["Пролет опор"].split(" ").join("");
            console.log("Найдена строка с косячным символом (не цифра и не тире) в пролете опор. Лишние символы удалены" + JSON.stringify(data));
            return false;
        }
        if (!(data["Дата текущего ремонта"] instanceof Date)) {
            console.log("Ошибка в написании даты " + typeof(data["Дата текущего ремонта"]) + JSON.stringify(data));
            return false;
        }
        if (new Date(data["Дата текущего ремонта"]) > new Date()) {
            console.log("Удалена строка с датой текущего ремонта из будущего!" + JSON.stringify(data));
            return false;
        }
        return true;
    });
    console.log(maintenanceTable.length);
    maintenanceTable.forEach(data => {
        //Уточняем местоположение опор        
        data["Местоположение с номером пути"] = data["Местоположение"] + data["Номер пути/съезда"];

        //Разбиваем диапазон опор в пределах которого проходил текущий ремонт на "начало" и "конец"
        [data["Начало пролета"], data["Конец пролета"]] = data["Пролет опор"].split("-");

        //Проверка на значения начальной и конечных опор
        if (parseInt(data["Начало пролета"]) > parseInt(data["Конец пролета"])) {
            [data["Начало пролета"], data["Конец пролета"]] = [data["Конец пролета"], data["Начало пролета"]];
        }
    });
    // var workbook = XLSX.utils.book_new();
    // var worksheet = XLSX.utils.json_to_sheet(maintenanceTable);
    // console.log(worksheet);
    // const sheet_name = "Ошибки обработки";
    // XLSX.utils.book_append_sheet(workbook, worksheet, sheet_name);
    // console.log(workbook);
    // XLSX.writeFile(workbook, "Ошибочки.xls", { cellDates: true });

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
            let poleStart = railwaysDataTable[i]["Опора"];
            let poleEnd = railwaysDataTable[i + 1]["Опора"];
            let poleRange = `${railwaysDataTable[i]["Опора"]}-${railwaysDataTable[i + 1]["Опора"]}`;
            let periodicity = railwaysDataTable[i]["Периодичность"];
            groupedByLocationData[railwaysDataTable[i]["Местоположение с номером пути"]] = [{ "Пролет опор": poleRange, "Начало пролета": poleStart, "Конец пролета": poleEnd, "Дата текущего ремонта": "", "Периодичность": periodicity }];
        }
        else {
            if (railwaysDataTable[i]["Местоположение с номером пути"] == railwaysDataTable[i + 1]["Местоположение с номером пути"]) {
                let poleStart = railwaysDataTable[i]["Опора"];
                let poleEnd = railwaysDataTable[i + 1]["Опора"];
                let poleRange = `${railwaysDataTable[i]["Опора"]}-${railwaysDataTable[i + 1]["Опора"]}`;
                let periodicity = railwaysDataTable[i]["Периодичность"];
            groupedByLocationData[railwaysDataTable[i]["Местоположение с номером пути"]].push({ "Пролет опор": poleRange, "Начало пролета": poleStart, "Конец пролета": poleEnd, "Дата текущего ремонта": "", "Периодичность": periodicity });
            }
        }
    }
}
/**
 * Для каждой опоры "Опора" в railwaysDataTable в пределах указанного диапазона указываем дату текущего ремонта
 * @param {MaintenanceTable} maintenanceTable 
 * @param {GroupedByLocationData} groupedByLocationData 
 */
function joinTables(maintenanceTable, groupedByLocationData) {
    maintenanceTable.forEach(maintenancedata => {
        for (const Местоположение in groupedByLocationData) {
            if (maintenancedata["Местоположение с номером пути"] == Местоположение) {
                let isCompare = false;
                if (isValidPoleInterval(maintenancedata, groupedByLocationData, Местоположение)) {
                    for (const sortdata of groupedByLocationData[Местоположение]) {
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
    })
}
/**
 * 
 */
function isValidPoleInterval(maintenancedata, groupedByLocationData, Местоположение) {
    let poleStartIsEquel = false;
    let poleEndIsEquel = false;
    const { "Начало пролета": start, "Конец пролета": end } = maintenancedata;

    for (const sortdata of groupedByLocationData[Местоположение]) {
        if (start === sortdata["Начало пролета"]) {
            poleStartIsEquel = true;
        }
        else if (String(parseInt(start)) === sortdata["Начало пролета"]) {
            poleStartIsEquel = true;
            console.log(`В диапазоне опор №${start}-${end} текущего ремонта ${Местоположение} в сутках ${maintenancedata["Дата текущего ремонта"]} содержится номер опоры, которого нет в нормативном журнале! Скорее всего имелся ввиду номер опоры №${sortdata["Начало пролета"]}`);
        }
        if (end === sortdata["Конец пролета"]) {
            poleEndIsEquel = true;
        }
        else if (String(parseInt(end)) === sortdata["Конец пролета"]) {
            poleEndIsEquel = true;
            console.log(`В диапазоне опор №${start}-${end} текущего ремонта ${Местоположение} в сутках ${maintenancedata["Дата текущего ремонта"]} содержится номер опоры, которого нет в нормативном журнале! Скорее всего имелся ввиду номер опоры №${sortdata["Конец пролета"]}`);
        }
    }
    if (!(poleStartIsEquel && poleEndIsEquel)) {
        console.log(`Начало (опора №${start} ${poleStartIsEquel}) или конец (опора №${end} ${poleEndIsEquel}) пролета опор проведенного текущего ремонта ${Местоположение} в сутках ${maintenancedata["Дата текущего ремонта"]} не верны! Так, у ${Местоположение} начало: ${groupedByLocationData[Местоположение][0]["Начало пролета"]} и конец ${groupedByLocationData[Местоположение][groupedByLocationData[Местоположение].length - 1]["Конец пролета"]}`);
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

    for (let Местоположение in groupedByLocationData) {
        let poleRangesData = groupedByLocationData[Местоположение];
        groupedByDateAndLocationData[Местоположение] = [];
        for (let i = 0; i < groupedByLocationData[Местоположение].length; i++) {
            let poleRangeData = groupedByLocationData[Местоположение][i];
            if (i === 0) {
                dateIsEqual = false;
                stack = [];
                groupedByDateAndLocationData[Местоположение] = [];
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
                groupedByDateAndLocationData[Местоположение].push({
                    "Начало пролета": poleStart,
                    "Конец пролета": poleEnd,
                    "Пролет опор": `${poleStart}-${poleEnd}`,
                    "Дата текущего ремонта": poleRangesData[i - 1]["Дата текущего ремонта"],
                    "Опора ranges count": stack.length,
                    "Относительная длина": stack.length / groupedByLocationData[Местоположение].length
                });
                poleStart = poleRangeData["Начало пролета"];
                poleEnd = poleRangeData["Конец пролета"];
                stack = [];
                stack.push(poleRangeData);
            }
            if (i === (groupedByLocationData[Местоположение].length - 1)) {
                groupedByDateAndLocationData[Местоположение].push({
                    "Начало пролета": poleStart,
                    "Конец пролета": poleEnd,
                    "Пролет опор": `${poleStart}-${poleEnd}`,
                    "Дата текущего ремонта": poleRangesData[i]["Дата текущего ремонта"],
                    "Опора ranges count": stack.length,
                    "Относительная длина": stack.length / groupedByLocationData[Местоположение].length
                });
            }
        }

    }

    return groupedByDateAndLocationData;
}