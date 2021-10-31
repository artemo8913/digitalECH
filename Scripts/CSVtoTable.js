const btnParseCsv = document.getElementById("btnParseCsv");
btnParseCsv.onclick = parseCsv;
let jsonFile;
/**Преобразует csv файл в JSON*/
function parseCsv() {
    const csvFile = document.getElementById("csvFile").files[0];
    Papa.parse(csvFile,{
        header: true,
        complete: function (results) {
            jsonFile = results.data;
            console.log(results.data);
            create2DTable(jsonFile);
        }
    })
}
/**Создает таблицу на основе двухмерного массива
 * @param matrix2D - двухмерный массив
*/
function create2DTable(matrix2D) {
    const table = document.createElement("table");
    const tHead = document.createElement("thead");
    const tBody = document.createElement("tbody");
    for (i = 0; i < matrix2D.length; i++) {
        const tRow = document.createElement("tr");
        for (j = 0; j < matrix2D[i].length; j++) {
            if (i == 0) {
                const tCell = document.createElement("th");
                tCell.innerHTML = matrix2D[i][j];
                tRow.appendChild(tCell);
                tHead.appendChild(tRow);
            }
            else {
                const tCell = document.createElement("td");
                tCell.innerHTML = matrix2D[i][j];
                tRow.appendChild(tCell);
                tBody.appendChild(tRow);
            }
        }
    }
    table.appendChild(tHead);
    table.appendChild(tBody);
    document.body.appendChild(table);
}