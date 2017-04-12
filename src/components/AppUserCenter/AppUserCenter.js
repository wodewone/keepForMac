import React, { Component } from "react"
import $http from "../../js/HttpRequest.js"
import autobind from "autobind-decorator"
import CSSModules from "react-css-modules"
import { Link, hashHistory } from "react-router"
import moment from "moment"
import Utils from "../../js/Utils.js"

import CommonAvatar from '../common/CommonAvatar.js'

import styles from "../../sass/appUsercenter.scss"

@CSSModules(styles, {allowMultiple: true})
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
                        <div styleName="user-avatar"><CommonAvatar userid={USERCENTER._id} avatar={USERCENTER.avatar}></CommonAvatar></div>
                        <div styleName="user-info">
                            <p styleName="user-name">{USERCENTER.username}</p>
                            <p styleName="user-desc">{USERCENTER.bio}</p>
                            <p styleName="user-other">
                                <span styleName="user-sp"><span className="fz14">{STATISTICS.totalEntries}</span><br/>动态</span><span styleName="user-sp"><span className="fz14">{STATISTICS.follow}</span><br/>关注</span><span styleName="user-sp"><span className="fz14">{STATISTICS.followed}</span><br/>粉丝</span>
                            </p>
                        </div>
                    </div>
                </header>
                <section styleName="center-main">
                    <div styleName="center-row">
                        <article styleName="row-block block-training">
                            <div styleName="row-block-inner">
                                <header styleName="block-header">我的训练</header>
                                <div styleName="block-caption">累计训练 <span styleName="caption-sp">999</span> 分钟</div>
                                <ul styleName="todo-list">
                                    <li styleName="todo-item">训练等级 <span styleName="todo-sp">1029次</span></li>
                                    <li styleName="todo-item">训练次数 <span styleName="todo-sp">303天</span></li>
                                    <li styleName="todo-item">连续训练 <span styleName="todo-sp">4天</span></li>
                                    <li styleName="todo-item">累计消耗 <span styleName="todo-sp">1292198千卡</span></li>
                                </ul>
                            </div>
                        </article>
                        <article styleName="row-block block-running">
                            <div styleName="row-block-inner">
                                <header styleName="block-header">我的跑步</header>
                                <div styleName="block-caption">累计训练 <span styleName="caption-sp">999</span> 分钟</div>
                                <ul styleName="todo-list">
                                    <li styleName="todo-item">训练等级 <span styleName="todo-sp">1029次</span></li>
                                    <li styleName="todo-item">训练次数 <span styleName="todo-sp">303天</span></li>
                                    <li styleName="todo-item">连续训练 <span styleName="todo-sp">4天</span></li>
                                    <li styleName="todo-item">累计消耗 <span styleName="todo-sp">1292198千卡</span></li>
                                </ul>
                            </div>
                        </article>
                        <article styleName="row-block block-cycling">
                            <div styleName="row-block-inner">
                                <header styleName="block-header">我的骑行</header>
                                <div styleName="block-caption">累计训练 <span styleName="caption-sp">999</span> 分钟</div>
                                <ul styleName="todo-list">
                                    <li styleName="todo-item">训练等级 <span styleName="todo-sp">1029次</span></li>
                                    <li styleName="todo-item">训练次数 <span styleName="todo-sp">303天</span></li>
                                    <li styleName="todo-item">连续训练 <span styleName="todo-sp">4天</span></li>
                                    <li styleName="todo-item">累计消耗 <span styleName="todo-sp">1292198千卡</span></li>
                                </ul>
                            </div>
                        </article>
                        <article styleName="row-block block-badge">
                            <div styleName="row-block-inner">
                                <header styleName="block-header">我的徽章</header>
                                <div styleName="block-caption">累计训练 <span styleName="caption-sp">999</span> 分钟</div>
                                <ul styleName="todo-list">
                                    <li styleName="todo-item">训练等级 <span styleName="todo-sp">1029次</span></li>
                                    <li styleName="todo-item">训练次数 <span styleName="todo-sp">303天</span></li>
                                    <li styleName="todo-item">连续训练 <span styleName="todo-sp">4天</span></li>
                                    <li styleName="todo-item">累计消耗 <span styleName="todo-sp">1292198千卡</span></li>
                                </ul>
                            </div>
                        </article>

                    </div>
                    <div styleName="center-row">
                        {/*<button styleName="row-button">训练等级</button>
                        <button styleName="row-button">跑步等级</button>
                        <button styleName="row-button">骑行等级</button>
                        <button styleName="row-button">我的徽章</button>
                        <button styleName="row-button">我的活动</button>
                        <button styleName="row-button">购物车</button>
                        <button styleName="row-button">我的订单</button>
                        <button styleName="row-button">优惠券</button>*/}
                    </div>
                </section>
            </div>
        )
    }
}

export default AppUserCenter