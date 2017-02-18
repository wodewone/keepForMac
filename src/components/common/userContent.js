import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import moment from 'moment'
import Utils from '../../js/Utils.js'

import '../../sass/app.scss'
import styles from '../../sass/userContent.scss'

import {remote} from 'electron'

@CSSModules(styles)
class UserContent extends Component{
    constructor(props){
        super(props)

        const userInfo = Utils.storage.has('userInfo') ? Utils.storage.get('userInfo') : {}

        this.state = {
            statistics: userInfo.statistics || {},
            trainings: userInfo.trainings || {},
            user: userInfo.user || {}
        }
    }

    @autobind
    componentWillMount(){
        //remote.getCurrentWindow().removeAllListeners()
        // 每次获得焦点时判断数据是否有更新
        remote.getCurrentWindow().on('focus', (e) => {
            const userInfo = Utils.storage.get('userInfo') || {}
            console.info(userInfo.user)
            if(userInfo.user && userInfo.user._id !== this.state.user._id){
                this.setState({
                    statistics: userInfo.statistics,
                    trainings: userInfo.trainings,
                    user: userInfo.user
                })
            }
        })
    }

    render(){
        return(
            <div styleName="user-container">
                <section styleName="user-back">
                    <div hidden={this.state.user.backgroundAvatar} styleName="back-cover" style={{backgroundImage: `url(${this.state.user.avatar})`}}></div>
                    <div hidden={!this.state.user.backgroundAvatar} styleName="back-avatar" style={{backgroundImage: `url(${this.state.user.backgroundAvatar})`}}></div>
                    <img styleName="user-avatar" src={this.state.user.avatar} alt=""/>
                    <div styleName="user-info-content">
                        <p styleName="user-info-name">{this.state.user.username}</p>
                        <p styleName="user-info-desc">{this.state.user.bio || '这个人很懒，啥都没写~'}</p>
                        <p className="fz12">{moment(new Date(this.state.user.birthday)).format('YYYY-MM-DD')}</p>
                    </div>
                </section>
            </div>
        )
    }
}

const container = document.createElement('div')
container.id = 'container'
container.className = 'container'
document.querySelector('body').appendChild(container)

ReactDOM.render(
    <UserContent />,
    document.getElementById('container')
)