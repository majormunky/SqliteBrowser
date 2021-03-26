const {app, BrowserWindow, ipcMain, dialog} = require("electron")
const sqlite3 = require("sqlite3").verbose()
const sql = require("sql-bricks-sqlite")

let win = null
let db = null

app.on("ready", () => {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile("index.html")
})


ipcMain.on("open-file-button-clicked", async (event) => {
    let result = await dialog.showOpenDialog(win)
    let table_names = []
    
    db = new sqlite3.Database(result.filePaths[0])

    let sql_statement = `SELECT name FROM sqlite_master 
        WHERE type IN ('table','view') 
        AND name NOT LIKE 'sqlite_%'ORDER BY 1;`;

    db.all(sql_statement, [], (err, rows) => {
        if (err) {
            throw err
        }

        rows.forEach((row) => {
            console.log(row.name)
            table_names.push(row.name)
        })

        event.reply("db-tables-loaded", table_names)
    })
})  

ipcMain.on("db-table-selected", async (event, data) => {
    let results = []
    let sql_statement = sql.select().from(data).toString()

    db.all(sql_statement, [], (error, rows) => {
        if (error) {
            console.log("Error:", error)
            return
        }
        
        console.log(rows)
        rows.forEach((row) => {
            results.push(row)
        })

        event.reply("table-rows-ready", results)
    })
})
