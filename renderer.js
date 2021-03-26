const {ipcRenderer} = require("electron")

document.getElementById("open-file-button").addEventListener("click", (event) => {
    ipcRenderer.send("open-file-button-clicked")
})

ipcRenderer.on("db-tables-loaded", (event, data) => {
    let output = ""
    let table_name
    for (var i = 0; i < data.table_names.length; i++) {
        table_name = data.table_names[i]
        output += `<span class='nav-group-item' data-db-name='${table_name}'>${table_name}</span>`
    }

    document.getElementById("db-table-wrapper").innerHTML += output
    document.getElementById("database-filename").innerHTML = `Database: ${data.database_name}`
})

function deselect_any_menu_items() {
    document.querySelectorAll(".active").forEach((el) => {
        el.classList.remove("active")
    })
}

function highlight_table_item(table_name) {
    deselect_any_menu_items()
    document.querySelector(`[data-db-name='${table_name}']`)?.classList.add("active")
}

document.getElementById("db-table-wrapper").addEventListener("click", (event) => {
    if (event.target.matches(".nav-group-item")) {
        let table_name_clicked = event.target.innerHTML
        deselect_any_menu_items()
        event.target.classList.add("active")
        ipcRenderer.send("db-table-selected", table_name_clicked)
    }
})

ipcRenderer.on("table-rows-ready", (event, data) => {
    // this happens when we have selected a table from the sidebar
    // we need to render the column headers and then the rows
    // from the table selected
    highlight_table_item(data.table)

    // this is our main table we render into
    let table_ele = document.getElementById("main-table")

    // build our column header
    let table_header = "<tr>"
    for (var i = 0; i < data.columns.length; i++) {
        table_header += `<th>${data.columns[i]}</th>`
    }
    table_header += "</tr>"
    // then set the output to our thead
    table_ele.querySelector("thead").innerHTML = table_header

    // now we need to render the rows
    let row, col_name
    let row_output = ""

    // this takes a long time if we have a bunch of rows
    // i wonder if we can just render the first 20 or so rows
    // show the rows to the user, and then in an async function
    // render the rest of the rows?
    for (var j = 0; j < data.rows.length; j++) {
        row = data.rows[j]
        row_output += "<tr>"
        // our row object keys may not be in the same order
        // as our column headers, so, to ensure that they line up
        // we loop over our column list and render fields by the column name
        for (var c = 0; c < data.columns.length; c++) {
            col_name = data.columns[c]
            row_output += `<td>${row[col_name]}</td>`
        }
        row_output += "</tr>"
    }
    // set our main table html
    table_ele.querySelector("tbody").innerHTML = row_output

    // show the table
    table_ele.style.display = "table"
})
