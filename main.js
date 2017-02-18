const {app, BrowserWindow} = require('electron')
const path = require('path')

let keep

const createWindow = () =>{
    keep = new BrowserWindow({
        'width': 999,
        'minWidth': 999,
        'height': 666,
        'minHeight': 666,
        //'resizable': false,
        'title': 'Keep',
        'center': true,
        'titleBarStyle': 'hidden',
        'zoomToPageWidth': true,
        'frame': false,
        //'show': false
    })

    keep.loadURL(`file://${__dirname}/app/index.html`)

    keep.webContents.openDevTools()
    //keep.webContents.on( 'did-finish-load', function () {
    //    keep.show();
    //})

    keep.on('close', (e) => {
        keep = null
    })

};

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate',() => {
    if (app == null)
        createWindow()
    app.show()
})