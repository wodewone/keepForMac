import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import moment from 'moment'
import Utils from '../../js/Utils.js'
import $http from '../../js/HttpRequest.js'

import '../../sass/app.scss'
import styles from '../../sass/userContent.scss'

import {remote} from 'electron'

@CSSModules(styles, {allowMultiple: true})
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
        console.info(this.state)

        //remote.getCurrentWindow().removeAllListeners()
        console.info(remote.getCurrentWindow())
        // 每次获得焦点时判断数据是否有更新
        remote.getCurrentWindow().on('focus', (e) => {
            const userInfo = Utils.storage.get('userInfo') || {}
            if(userInfo.user && userInfo.user._id !== this.state.user._id){
                this.setState({
                    statistics: userInfo.statistics,
                    trainings: userInfo.trainings,
                    user: userInfo.user
                })
                //remote.getCurrentWindow().setTitle('keeper - '+ userInfo.user.username)
            }
        })

    }

    @autobind
    componentWillUnmount(){
        this.state = null
        Utils.storage.remove('userInfo')
    }

    @autobind
    getCityAddress(cityCode){
        const city = Utils.storage.get('cityJson').filter((item) => cityCode == item.cityCode)[0]
        return city ? city : {cityName:'银河,地球'}
    }

    @autobind
    handleFriend(){
        if(this.state.user.relation) {
            $http.removeUserFollow(this.state.user._id)
        }else{
            $http.addUserFollow(this.state.user._id)
        }
        $http.getUserData(this.state.user._id).then((res) => {
            if(res.ok){
                this.setState({
                    statistics: res.data.statistics,
                    trainings: res.data.trainings,
                    user: res.data.user
                })
            }
        })
    }

    render(){
        return(
            <div styleName="user-container">
                <section styleName="user-back">
                    <div styleName="back-cover" style={{backgroundImage: `url(${this.state.user.backgroundAvatar ? this.state.user.backgroundAvatar : this.state.user.avatar}?imageMogr2/thumbnail/!300x300r)`}}></div>
                    <div styleName="user-avatar"><img src={this.state.user.avatar ? this.state.user.avatar+'?imageMogr2/thumbnail/!200x200r' : ''} alt=""/></div>
                    <div styleName="user-info-content">
                        <p styleName="user-info-name"><span>{this.state.user.username}</span></p>
                        <p styleName="user-info-desc"><span>{this.state.user.bio || '这个人很懒，啥都没写~'}</span></p>
                        <p styleName="user-info-other"><span>{moment(new Date(this.state.user.birthday)).format('YYYY-MM-DD')}</span> | <span>{this.getCityAddress(this.state.user.citycode || '').cityName}</span></p>
                        <p styleName="user-info-config">
                            {`${this.state.statistics.follow}关注`} - {`${this.state.statistics.followed}粉丝`} - {`${this.state.statistics.totalEntries}个动态`} - {`${this.state.statistics.liked}人加油`}
                        </p>
                    </div>
                </section>
                <section styleName="user-training">
                    <div styleName="user-training-line">累计训练 <div styleName="user-training-data">{this.state.trainings.totalDuration} 分钟</div></div>
                    <div styleName="user-training-line">训练次数 <div styleName="user-training-data">{this.state.trainings.totalTraining} 次</div></div>
                    <div styleName="user-training-line">训练天数 <div styleName="user-training-data">{this.state.trainings.totalTrainingDay} 天</div></div>
                    <div styleName="user-training-line">最长连续 <div styleName="user-training-data">{this.state.trainings.maxCombo} 天</div></div>
                    <div styleName="user-training-line">连续训练 <div styleName="user-training-data">{this.state.trainings.currentCombo} 天</div></div>
                    <div styleName="user-training-line">累计消耗 <div styleName="user-training-data">{this.state.trainings.totalCalorie} 千卡</div></div>
                    <div styleName="both-line">
                        <Link to='' styleName="line-btn">去Ta主页(暂未开发)</Link>
                        <button styleName={this.state.user.relation ? 'follow-btn active' : 'follow-btn'} onClick={this.handleFriend}>
                            <span styleName="sp-default">{!this.state.user.relation ? '关注Ta' : this.state.user.relation == 2 ? '已关注' : '相互关注'}</span>
                            <span styleName="sp-hover">{!this.state.user.relation ? '关注Ta' : '取消关注'}</span>
                        </button>
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