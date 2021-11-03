const btnLoadGeneralDataFile = document.getElementById("btnLoadGeneralDataFile");
const btnMaintenanceDataFile = document.getElementById("btnMaintenanceDataFile");


btnLoadGeneralDataFile.onclick = parseGeneralDataCsv;
btnMaintenanceDataFile.onclick = parseMaintenanceDataCsv;

function parseGeneralDataCsv() {
    //@ts-ignore
    const csvFile = document.getElementById("generalDataFile").files[0];
    Papa.parse(csvFile, {
        header: true,
        complete: function (results) {
            generalData = results.data;
            processGeneralData(generalData);
        }
    })
}
function parseMaintenanceDataCsv() {
    //@ts-ignore
    const csvFile = document.getElementById("maintenanceDataFile").files[0];
    Papa.parse(csvFile, {
        header: true,
        complete: function (results) {
            maintenanceData = results.data;
            // console.log(maintenanceData);
            processMaintanceData(maintenanceData);
        }
    })
}
