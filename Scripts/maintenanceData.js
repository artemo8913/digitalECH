/**
 * Общие данные по опорам, перегонам контактной сети. Содержат в себе
 * данные о перегонах/станциях, номера принадлежащим им опорам, даты проведения текущего ремонта с привязкой к опорам 
 * @type {Array.<{"Location":string,
 * "Railway/waypoint":string,
 * "Railway/waypoint number":string,
 * "Concrete pole":string,
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
let poleRange = {"Kozulka1":20,
                    "Kozulka3":2};

function processMaintanceData(Data){
    Data.forEach(data => {
        data["Location Name"] = data["Location"] + data["Railway/waypoint number"];
        data["Pole start"] = parseInt(data["Pole range"].split("-")[0]);
        data["Pole end"] = parseInt(data["Pole range"].split("-")[1]);
    });
}

/**
 * Функция расчета количества опор на станциях и путях
 * @param {generalData} Data
* returns {{"location": string}}
 */
 function countPoleRange(Data) {
    poleRange = {};
    Data.forEach(data => data["Location Name"] = data["Location"] + data["Railway/waypoint number"]);
    for (const data of Data) {
        if(!poleRange[data["Location Name"]]){
            poleRange[data["Location Name"]] = 1;
        }
        else{
            poleRange[data["Location Name"]] += 1;
        }
    }
}