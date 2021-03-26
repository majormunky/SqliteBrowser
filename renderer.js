const {ipcRenderer} = require("electron")

document.getElementById("open-file-button").addEventListener("click", (event) => {
    ipcRenderer.send("open-file-button-clicked")
})

ipcRenderer.on("db-tables-loaded", (event, data) => {
    let output = ""
    for (var i = 0; i < data.length; i++) {
        output += "<span class='nav-group-item'>"
        output += data[i]
        output += "</span>"
    }

    document.getElementById("db-table-wrapper").innerHTML += output
})

document.getElementById("db-table-wrapper").addEventListener("click", (event) => {
    if (event.target.matches(".nav-group-item")) {
        let table_name_clicked = event.target.innerHTML
        ipcRenderer.send("db-table-selected", table_name_clicked)
    }
})

ipcRenderer.on("table-rows-ready", (event, data) => {
    console.log(data)
})
