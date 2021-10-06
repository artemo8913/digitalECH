const btnParseCsv = document.getElementById("btnParseCsv");
btnParseCsv.onclick = parseCsv;
let jsonFile;

function parseCsv() {
    const csvFile = document.getElementById("csvFile").files[0];
    Papa.parse(csvFile, {
        complete: function (results) {
            console.log(results);
            jsonFile = results.data;
            createTable();
        }
    })
}
function createTable() {
    const table = document.createElement("table");
    const tHead = document.createElement("thead");
    const tBody = document.createElement("tbody");
    for (i = 0; i < jsonFile.length; i++) {
        const tRow = document.createElement("tr");
        for (j = 0; j < jsonFile[i].length; j++) {
            if (i == 0) {
                const tCell = document.createElement("th");
                tCell.innerHTML = jsonFile[i][j];
                tRow.appendChild(tCell);
                tHead.appendChild(tRow);
            }
            else {
                const tCell = document.createElement("td");
                tCell.innerHTML = jsonFile[i][j];
                tRow.appendChild(tCell);
                tBody.appendChild(tRow);
            }
        }
    }
    table.appendChild(tHead);
    table.appendChild(tBody);
    document.body.appendChild(table);
}