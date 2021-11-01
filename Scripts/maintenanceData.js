/**
 * Общие данные по опорам, перегонам контактной сети. Содержат в себе
 * данные о перегонах/станциях, номера принадлежащим им опорам, даты проведения текущего ремонта с привязкой к опорам 
 * @type {Array.<{"Location":string,
 * "Railway/waypoint":string,
 * "Railway/waypoint number":string,
 * "Pole":string,
 * "Date Maintenance":string,
 * "Location Name":string}>}
 */
let generalData = [];
/**
 * Данные о выполненном текущем ремонте. Содержат в себе данные о местоположении, и диапазоне опор в которых проводился текущий ремонт
 * Location;Railway/waypoint;Railway/waypoint number;Pole range;Date
 * @type {{"Location":string,
 * "Railway/waypoint":string,
 * "Railway/waypoint number":string,
 * "Pole range":string,
 * "Pole start": string,
 * "Pole end": string,
 * "Date Maintenance":string,
 * "Location Name":string}[]}
 */
let maintenanceData = [];
/**
 * @type {{"Location Name":number}} poleRange
 */
let poleRange;
/**
 * Производим операции с данными текущего ремонта
 * @param {maintenanceData} maintenanceData 
 */
function processMaintanceData(maintenanceData){
    //Уточняем местоположение опор
    maintenanceData.forEach(data => {
        data["Location Name"] = data["Location"] + data["Railway/waypoint number"];
        //Разбиваем диапазон опор в пределах которого проходил текущий ремонт на "начало" и "конец"
        data["Pole start"] = data["Pole range"].split("-")[0];
        data["Pole end"] = data["Pole range"].split("-")[1];
    });
    //Для каждой опоры "Pole" в generalData в пределах указанного диапазона указать дату текущего ремонта
    maintenanceData.forEach(data =>{
        
    })
    
}

/**
 * Функция расчета количества опор на станциях и путях
 * @param {generalData} generalData
 * returns {{"location": string}}
 */
 function countPoleRange(generalData) {
    poleRange = {};
    //Уточняем местоположение опор
    generalData.forEach(data => data["Location Name"] = data["Location"] + data["Railway/waypoint number"]);
    //РАссчитываем количество опор на станциях и путях
    for (const data of generalData) {
        if(!poleRange[data["Location Name"]]){
            poleRange[data["Location Name"]] = 1;
        }
        else{
            poleRange[data["Location Name"]] += 1;
        }
        // console.log(data);
    }
    // console.log(poleRange);
}