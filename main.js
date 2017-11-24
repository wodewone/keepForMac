const {app, BrowserWindow, Menu, Tray} = require('electron')
const appMenuTemplate = require('./electron/app-menu-template');
const path = require('path')
const iconIdle = path.join(__dirname, 'icos', '16x16.png');

const isDarwin = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';

let keepWindow

const createWindow = () => {
    let initWindow = () => {
        keepWindow = new BrowserWindow({
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
            'show': false
        })

        keepWindow.loadURL(`file://${__dirname}/app/index.html`)

        //keepWindow.webContents.openDevTools()
        keepWindow.webContents.on('did-finish-load', function () {
            keepWindow.show();
        })

        keepWindow.on('close', (e) => {
            keepWindow = null
        })
        const menu = Menu.buildFromTemplate(appMenuTemplate);
        Menu.setApplicationMenu(menu);
    }

    initWindow();
};

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (!isDarwin) {
        app.quit()
    }
})

app.on('activate', () => {
    if (keepWindow) createWindow()
    keepWindow.show()
})