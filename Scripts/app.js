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

async function mainProcess(callback) {
    const btnMaintenanceDataFile = document.getElementById("btnMaintenanceDataFile");
    // btnMaintenanceDataFile.onclick = mainProcess;

    /**
     * @type {HTMLObjectElement}
     */
    //@ts-ignore
    const obj = document.getElementById("svgDocument__content");
    const svgDoc = obj.contentDocument;
    const svgSchemeTitles = svgDoc.getElementsByTagName("title");
    const svgProcessBtn = document.getElementById("svgProcess");

    let railwaysDataTable = await parseRailwaysDataCsv();
    let maintenanceTable = await parseMaintenanceDataCsv();

    /** @type {GroupedByLocationData} */
    //@ts-ignore
    let groupedByLocationData = {};

    /** @type {GroupedByDateAndLocationData} */
    //@ts-ignore
    let groupedByDateAndLocationData = {};

    processRailwaysData(railwaysDataTable, groupedByLocationData);
    processMaintanceData(maintenanceTable, groupedByLocationData);
    groupedByDateAndLocationData = groupRailwaysDataByDate(groupedByLocationData);

    console.log(groupedByLocationData);
    console.log(groupedByDateAndLocationData);

    svgProcessV2(svgSchemeTitles, groupedByDateAndLocationData);
}

window.addEventListener('load', (event) => {
    mainProcess();
});
