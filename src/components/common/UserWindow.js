import autobind from 'autobind-decorator'
import Utils from '../../js/Utils.js'

import {remote} from 'electron'

export default {
    winUser: null,
    has(){
        return !!this.winUser
    },
    check(){
        return this.winUser
    },
    create(title){
        this.winUser = new remote.BrowserWindow({
            'width': 333,
            'height': 520,
            'title': 'keeper - '+ title,
            'titleBarStyle': 'hidden',
            'center': true,
            'minimizable': false,
            'maximizable': false,
            'fullscreen': false,
            'fullscreenable': false,
            'backgroundColor': '#584f5f',
            'alwaysOnTop': true,
            //'show': false,
            'resizable': false,
        })
        this.winUser.loadURL(`file://${require('path').resolve()}/app/userContent.html`)
        this.winUser.on('close', () =>{
            this.winUser = null
            console.info('user-window:',this.winUser)
        })
        //this.winUser.once('ready-to-show', () => {
        //    this.winUser.show()
        //})
    },
    show(){
        typeof this.winUser.focus === 'function' && this.winUser.focus()
    }
}