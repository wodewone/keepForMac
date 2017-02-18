import autobind from 'autobind-decorator'
import Utils from '../../js/Utils.js'

import {BrowserWindow} from 'electron'

export default {
    winUser: null,
    has(){
        return !!this.winUser
    },
    check(){
        return this.winUser
    },
    create(){
        this.winUser = new BrowserWindow({
            'width': 333,
            'height': 500,
            'title': 'usercenter',
            'titleBarStyle': 'hidden',
            'center': true,
            //'alwaysOnTop': true,
            //'resizable': false,
        })
        this.winUser.loadURL(`file://${require('path').resolve()}/app/userContent.html`)
        this.winUser.on('close', () =>{
            this.winUser = null
            console.info('user-window:',this.winUser)
        })
        this.winUser.show()
    },
    show(){
        typeof this.winUser.focus === 'function' && this.winUser.focus()
    }
}