/** @type {HTMLObjectElement} *///@ts-ignore
const btnScaleIncrease = document.getElementsByClassName("svgDocument__scale-change_increase")[0];

/** @type {HTMLObjectElement} *///@ts-ignore
const btnScaleDecrease = document.getElementsByClassName("svgDocument__scale-change_decrease")[0];

/** @type {HTMLObjectElement} *///@ts-ignore
const obj = document.getElementById("svgDocument__content");
const svgDoc = obj.contentDocument;
const svgElement = svgDoc.getElementsByTagName("svg")[0];

/** @type {HTMLObjectElement} *///@ts-ignore
const svgContainer = document.getElementsByClassName("svgDocument__conteiner")[0];
const svgSchemeTitles = svgDoc.getElementsByTagName("title");
let svgSchemeDesc;
svgDoc.addEventListener("DOMContentLoaded", () => {
    svgSchemeDesc = Array.from(svgDoc.getElementsByTagName("desc"))
        .filter(desc => desc.innerHTML.startsWith("Станция"));
        navigationInitial(svgSchemeDesc);
});

const svgProcessBtn = document.getElementById("svgProcess");

document.getElementById("maintenanceTableFile").addEventListener('change', mainProcess, false);

function parseRailwaysDataCsv() {
    //@ts-ignore
    // const csvFile = document.getElementById("railwaysDataTableFile").files[0];
    const csvFile = railwaysDataTableStr;
    const promise = new Promise(resolve => {
        Papa.parse(csvFile, {
            header: true,
            complete: function (results) {
                resolve(results.data);
            }
        });
    });
    return promise;
}

function parseMaintenanceDataCsv() {
    //@ts-ignore
    const csvFile = document.getElementById("maintenanceTableFile").files[0]; //maintenanceTableStr; // 
    // const csvFile = maintenanceTableStr;
    return new Promise(resolve => Papa.parse(csvFile, {
        header: true,
        complete: function (results) {
            resolve(results.data);
        }
    }));
}

async function parseMaintenanceData(e) {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { cellDates: true });
    return Promise.resolve(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
}

async function mainProcess(e) {
    let railwaysDataTable = await parseRailwaysDataCsv();
    let maintenanceTable = await parseMaintenanceData(e);
    console.log(maintenanceTable);

    /** @type {GroupedByLocationData} *///@ts-ignore
    let groupedByLocationData = {};

    /** @type {GroupedByDateAndLocationData} *///@ts-ignore
    let groupedByDateAndLocationData = {};

    processRailwaysData(railwaysDataTable, groupedByLocationData);
    processMaintanceData(maintenanceTable, groupedByLocationData);
    groupedByDateAndLocationData = groupRailwaysDataByDate(groupedByLocationData);

    console.log(groupedByLocationData);
    console.log(groupedByDateAndLocationData);

    svgProcessV2(svgSchemeTitles, groupedByLocationData, groupedByDateAndLocationData);

    const maxScale = 1.6;
    const minScale = 0.2;
    const scaleStep = 0.2;

    const cameraInfo = {
        currentScale: 1,
        currentOriginPos: { x: 0, y: 0 },
    };

    btnScaleIncrease.onclick = () => {
        cameraInfo.currentScale = Math.min(maxScale, cameraInfo.currentScale + scaleStep);
        if (cameraInfo.currentScale < maxScale) {
            changeSvgScale(svgElement, svgContainer, 1 + scaleStep);
        }
    };
    btnScaleDecrease.onclick = () => {
        cameraInfo.currentScale = Math.max(minScale, cameraInfo.currentScale - scaleStep);
        if (cameraInfo.currentScale > minScale) {
            changeSvgScale(svgElement, svgContainer, 1 - scaleStep);
        }
    };
    svgElement.addEventListener("click", event => console.log(event));
}
