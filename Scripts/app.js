function parseRailwaysDataCsv() {
    //@ts-ignore
    // const csvFile = document.getElementById("railwaysDataTableFile").files[0];
    const csvFile = railwaysDataTableStr;
    const promise = new Promise((resolve) => {
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
    const csvFile = maintenanceTableStr; // document.getElementById("maintenanceTableFile").files[0];
    return new Promise(resolve => Papa.parse(csvFile, {
        header: true,
        complete: function (results) {
            resolve(results.data);
        }
    }));
}

async function mainProcess() {
    const btnMaintenanceDataFile = document.getElementById("btnMaintenanceDataFile");
    /** @type {HTMLObjectElement} *///@ts-ignore
    const btnScaleIncrease = document.getElementsByClassName("svgDocument__scale-change_increase")[0];
    /** @type {HTMLObjectElement} *///@ts-ignore
    const btnScaleDecrease = document.getElementsByClassName("svgDocument__scale-change_decrease")[0];

    // btnMaintenanceDataFile.onclick = mainProcess;

    /** @type {HTMLObjectElement} *///@ts-ignore
    const obj = document.getElementById("svgDocument__content");
    const svgDoc = obj.contentDocument;
    const svgElement = svgDoc.getElementsByTagName("svg")[0];
    /** @type {HTMLObjectElement} *///@ts-ignore
    const svgContainer = document.getElementsByClassName("svgDocument__conteiner")[0];
    const svgSchemeTitles = svgDoc.getElementsByTagName("title");
    const svgProcessBtn = document.getElementById("svgProcess");

    let railwaysDataTable = await parseRailwaysDataCsv();
    let maintenanceTable = await parseMaintenanceDataCsv();

    /** @type {GroupedByLocationData} *///@ts-ignore
    let groupedByLocationData = {};

    /** @type {GroupedByDateAndLocationData} *///@ts-ignore
    let groupedByDateAndLocationData = {};

    processRailwaysData(railwaysDataTable, groupedByLocationData);
    processMaintanceData(maintenanceTable, groupedByLocationData);
    groupedByDateAndLocationData = groupRailwaysDataByDate(groupedByLocationData);

    console.log(groupedByLocationData);
    console.log(groupedByDateAndLocationData);

    svgProcessV2(svgSchemeTitles, groupedByDateAndLocationData);

    let scaleStep = 0.2;
    btnScaleIncrease.onclick = () => svgScale(svgContainer, svgElement, 1 + scaleStep, true);
    btnScaleDecrease.onclick = () => svgScale(svgContainer, svgElement, 1 - scaleStep, false);
}

window.addEventListener('load', (event) => {
    mainProcess();
});
