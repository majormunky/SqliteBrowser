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
    let db_path = result.filePaths[0]
    let db_name = db_path.split("/").pop()
    let response = {"table_names": [], "database_name": db_name}
    
    db = new sqlite3.Database(result.filePaths[0])

    let sql_statement = `SELECT name FROM sqlite_master 
        WHERE type IN ('table','view') 
        AND name NOT LIKE 'sqlite_%'ORDER BY 1;`;

    db.all(sql_statement, [], (err, rows) => {
        if (err) {
            throw err
        }

        rows.forEach((row) => {
            response.table_names.push(row.name)
        })

        event.reply("db-tables-loaded", response)
    })
})  

ipcMain.on("db-table-selected", async (event, data) => {
    let results = {"columns": null, "rows": []}
    let sql_statement = sql.select().from(data).toString()

    db.all(sql_statement, [], (error, rows) => {
        if (error) {
            console.log("Error:", error)
            return
        }

        rows.forEach((row) => {
            results.rows.push(row)
            if (results.columns === null) {
                results.columns = Object.keys(row)
            }
        })

        event.reply("table-rows-ready", results)
    })
})
