/* save html table content into js array */
function saveTable(id) {
    tableRows = document.getElementById(id).rows
    tableData = []
    for (var i = 0; i < tableRows.length; i++) {
        rows = tableRows[i].children
        row = []
        for (var i2 = 0; i2 < rows.length; i2++) {
            row.push(rows[i2].innerText);
        }
        tableData.push(row)
    }
    return tableData
}
