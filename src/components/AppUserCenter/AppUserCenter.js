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
        const STATISTICS = this.state.usercenter.statistics
        return(
            <div className="scroll-content" styleName="page-content">
                <header styleName="center-header">
                    <div styleName="header-back" style={{backgroundImage: `url(${USERCENTER.backgroundAvatar})`}}></div>
                    <div styleName="header-inner">
                        <img styleName="user-avatar" src={USERCENTER.avatar} alt={USERCENTER.username}/>
                        <p styleName="user-info"><span styleName="user-name">{USERCENTER.username}</span> <br/> <span styleName="user-desc">{USERCENTER.bio}</span>
                            <br/> {STATISTICS.totalEntries}动态 {STATISTICS.follow}关注 {STATISTICS.followed}粉丝</p>
                    </div>
                </header>
                <section styleName="center-main">
                    <div styleName="center-row">
                        <button styleName="row-button">训练等级</button>
                        <button styleName="row-button">跑步等级</button>
                        <button styleName="row-button">骑行等级</button>
                        <button styleName="row-button">我的徽章</button>
                        <button styleName="row-button">我的活动</button>
                    </div>
                    <div styleName="center-row">
                        <button styleName="row-button">购物车</button>
                        <button styleName="row-button">我的订单</button>
                        <button styleName="row-button">优惠券</button>
                    </div>
                </section>
            </div>
        )
    }
}

export default AppUserCenter