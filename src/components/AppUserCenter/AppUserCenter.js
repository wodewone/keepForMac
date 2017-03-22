import React, { Component } from "react"
import $http from "../../js/HttpRequest.js"
import autobind from "autobind-decorator"
import CSSModules from "react-css-modules"
import { Link, hashHistory } from "react-router"
import moment from "moment"
import Utils from "../../js/Utils.js"

import styles from "../../sass/appUsercenter.scss"

@CSSModules(styles)
class AppUserCenter extends Component{
    constructor(props){
        super(props)

        this.state = {
            "usercenter" : Utils.storage.get("mineInfo") || null
        }
    }

    componentWillMount(){
        console.info(this.state.usercenter)
    }

    render(){
        const USERCENTER = this.state.usercenter.user
        return(
            <div className="scroll-content">
                <header styleName="center-header">
                    <div styleName="header-back" style={{backgroundImage: `url(${USERCENTER.backgroundAvatar})`}}></div>
                    <div styleName="header-inner">
                        <img styleName="user-avatar" src={USERCENTER.avatar} alt={USERCENTER.username}/>
                        <p styleName="user-name">{USERCENTER.username}</p>
                    </div>
                </header>
            </div>
        )
    }
}

export default AppUserCenter