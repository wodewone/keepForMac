import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import moment from 'moment'
import { Link } from 'react-router'
import Utils from '../../js/Utils.js'
import TrainingBlock from './TrainingBlock.js'
import AppScroll from './AppScroll.js'

import styles from '../../sass/appTraining.scss'

import $http from '../../js/HttpRequest.js'

@CSSModules(styles)
class AppTraining extends Component{
    constructor(props){
        super(props)

        const localTraining = Utils.storage.get('trainingWorkouts')

        this.state = {
            trainingGuidance: localTraining ? localTraining[0] : {},
            trainingSchedules: localTraining ? localTraining[1] : {},
            trainingWorkouts: localTraining ? localTraining[2] : {},
            recommendCourses: localTraining ? localTraining[3] : {},
            recommendBook: localTraining ? localTraining[4] : {},
            trainingData: {},
            rankingData: {
                'paperwork': '本周好友训练排名'
            }
        }
    }

    @autobind
    componentWillMount(){
        const authentication = Utils.storage.get('authentication') || {}

        // 判断是否登录
        if(authentication && authentication.token) {
            $http.getDashboardStatistics().then((response) => {
                if (response.ok) {
                    this.setState({trainingData: response.data})
                }
            }).catch((error) => {
                console.info('getDashboardStatistics:', error)
            })

            $http.getRankingData().then((response) => {
                if (response.ok) {
                    this.setState({rankingData: response.data})
                }
            }).catch((error) => {
                console.info('getRankingData:', error)
            })

            $http.getDashboardTraining().then((response) => {
                if (response.ok) {
                    this.setState({
                        trainingGuidance: response.data[0],
                        trainingSchedules: response.data[1],
                        trainingWorkouts: response.data[2],
                        recommendCourses: response.data[3],
                        recommendBook: response.data[4],
                    })
                    //Utils.storage.set('trainingPlan',response.data)
                    Utils.storage.set('trainingWorkouts',response.data)
                    console.info(response.data);
                }
            }).catch((error) => {
                console.info('getDashboardTraining:', error)
            })

            //$http.getDashboardWorkouts().then((response) => {
            //    if (response.ok) {
            //        this.setState({
            //            trainingWorkouts: response.data.workouts
            //        })
            //        Utils.storage.set('trainingWorkouts',response.data)
            //    }
            //}).catch((error) => {
            //    console.info('getDashboardWorkouts:', error)
            //})
        } else {
            this.props.router.replace('/login')
        }
    }

    @autobind
    getScheduleContent(){
        const schedule = this.state.trainingSchedules
        if(!schedule.schedule)
            return false

        const lesson = schedule.schedule
        const startDate = moment(moment(lesson.startDate).format('YYYYMMDD')).diff(moment().format('YYYYMMDD'), 'd')
        const workouts = lesson.schedule.days
        const totalPlansDays = lesson.schedule.totalDaysCount
        const successDays = 1-startDate < totalPlansDays ? 1-startDate : totalPlansDays
        let workTotalTime = []
        let dateTips = ''

        for(let item of workouts){
            workTotalTime = [...workTotalTime, ...item.workouts]
            //workTotalTime += item.duration
        }
        const planProgress = (lesson.completedWorkouts.length/workTotalTime.length*100).toFixed(2)

        switch (true) {
            case startDate <= -totalPlansDays:
                dateTips = '已过期'
                break

            case startDate == 0:
                dateTips = false
                break

            case startDate == 1:
                dateTips = '课程将于明天开始，准备好了吗？'
                break

            case startDate > 1:
                dateTips = `课程将于 ${moment(lesson.startDate).format('MM')}/${moment(lesson.startDate).format('DD')} 开始`
                break

            default:
                dateTips = ''
        }

        if (!dateTips) {
            dateTips = `第 ${successDays}/${totalPlansDays} 天 `
            if(workouts[-startDate].workouts.length){
                dateTips += `${workouts[-startDate].duration}分钟  ${workouts[-startDate].workouts.length}个训练`
            }else{
                dateTips += `休息日`
            }
        }

        return(
            <article styleName="training-lesson" style={{backgroundImage: `url(${lesson.schedule.picture})`}}>
                <p styleName="training-block-title">{lesson.schedule.name}</p>
                <p styleName="training-block-desc">{dateTips}</p>
                <span className="text-left" styleName="training-block-info">
                    <span className="fz10">完成{planProgress}%</span>
                    <div styleName="plan-progress-bar">
                        <span style={{width: `${planProgress}%`}} styleName="progress-bar-inner"></span>
                    </div>
                </span>
            </article>
        )
    }

    @autobind
    getTrainingData(){
        const workouts = this.state.trainingWorkouts

        if(workouts.plans && workouts.plans.length)
            return(
                workouts.plans.map((item)=> {
                    return <TrainingBlock key={item.id} data={item} />
                })
            )
    }

    @autobind
    getPhysicalGuide(){
        let data = this.state.trainingGuidance
        if(!data.physicalGuide){
            return false
        }

        return(
            <section hidden={!data.physicalGuide.launch} className={`margin-bottom white-background`}>
                <p styleName="guide-tips"><i style={{marginLeft: '-3px'}} className={`iconfont icon-symbol fz18`}></i><br/>{data.physicalGuide.tips}</p>
                <div className="text-center">
                    <Link styleName="button-guide-start" >进行运动能力测试</Link>
                </div>
            </section>
        )
    }

    render(){
        return(
            <div className="scroll-content">
                <section className={`margin-bottom white-background`}>
                    <Link styleName="training-data">
                        <div styleName="training-data-title">
                            总共训练
                            <i className={`iconfont icon-more pull-right`}></i>
                        </div>
                        <div className="text-center">
                            <span style={{fontSize: '50px'}}>{this.state.trainingData.totalDuration}</span> 分钟
                        </div>
                        <div styleName="training-data-other">
                            <figure styleName="other-item-first">
                                完成<br/>
                                <span styleName="data-val">{this.state.trainingData.totalTraining}</span>次
                            </figure>
                            <figure styleName="other-item-second">
                                累计<br/>
                                <span styleName="data-val">{this.state.trainingData.totalTrainingDay}</span>天
                            </figure>
                            <figure styleName="other-item-three">
                                消耗<br/>
                                <span styleName="data-val">{this.state.trainingData.totalCalorie}</span>千卡
                            </figure>
                        </div>
                    </Link>
                    <Link styleName="training-ranking">
                        <p styleName="training-ranking-title"><span styleName="training-ranking-num">{this.state.rankingData.me && this.state.rankingData.me.ranking} </span> {this.state.rankingData.paperwork}</p>
                        <div >
                            <span hidden={!this.state.rankingData.next} styleName="ranking-user"><img src={this.state.rankingData.next && this.state.rankingData.next.user.avatar} alt=""/></span>
                            <span styleName="ranking-user"><img src={this.state.rankingData.me && this.state.rankingData.me.user.avatar} alt=""/></span>
                            <span hidden={!this.state.rankingData.prev} styleName="ranking-user"><img src={this.state.rankingData.prev && this.state.rankingData.prev.user.avatar} alt=""/></span>
                        </div>
                    </Link>
                </section>
                {this.getPhysicalGuide()}
                <section className={`margin-bottom white-background`}>
                    <div className="padding">我的课程表</div>
                    {this.getScheduleContent()}
                </section>
                <section className={`margin-bottom white-background`}>
                    <div className="padding">我的训练</div>
                    <div styleName="training-block-wrap">
                        {this.getTrainingData()}
                    </div>
                </section>
                <AppScroll data={this.state.recommendCourses} />
                <AppScroll data={this.state.recommendBook} />
            </div>
        )
    }
}

export default AppTraining