import React, { Component } from 'react'
import {Link} from 'react-router'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import moment from 'moment'
import Utils from '../../../js/Utils.js'
import http from '../../../js/HttpRequest.js'

import styles from '../../../sass/appWorkouts.scss'

import {remote} from 'electron'

@CSSModules(styles, {allowMultiple: true})
class AppWorkout extends Component{
    constructor(props){
        super(props)
        let workouts = Utils.storage.get('workouts') || []

        this.state = {
            user: Utils.storage.get('userData') || {},
            workouts: !workouts.length ? workouts : [],
            workout: !workouts.length ? {} : new Map(workouts).has(this.props.params.plan_id) ? new Map(workouts).get(this.props.params.plan_id) : {},
            content: {},
            classBlur: 'workout-mask'   // 显示弹出层时内容层 *blurry*
        }
    }

    @autobind
    componentWillMount(){
        console.info(this.state.workout)
        if(!this.state.workout._id) {
            // 获取锻炼项目详情
            http.getPlansContent(this.props.params.plan_id, this.state.user.gender).then((response) => {
                if (response.ok) {
                    Utils.storage.set('workouts', [...new Set(this.state.workouts).add([this.props.params.plan_id, response.data])])

                    this.setState({
                        workout: response.data
                    })
                }
            })
        }

        // 获取 总打卡数量/训练评论/完成用户/座右铭
        http.getWorkoutsContent(this.props.params.plan_id).then((response) => {
            if(response.ok){
                Utils.storage.set('timeoutTip', response.data.motto)
                this.setState({
                    content: response.data
                })
            }
        })
    }

    @autobind
    getPioneerContent(){
        const list = this.state.content.pioneer
        // const userImg = require('url-loader?mimetype=image/png!../../../assets/images/keep-small.jpg')
        if(!list)
            return false

        return list.map((item, index) => {
            return <li key={item._id + index}><Link styleName="pioneer-item" onClick={() => http.getUserData(item._id).then((data) => console.info(data))} ><img src={item.avatar} alt=""/></Link></li>
        })
    }

    @autobind
    getWorkoutDynamic(){
        const list = this.state.content.timeline
        if(!list)
            return false

        return list.map((item) => {
            let completeTime = moment(new Date()).diff(moment(item.created), 'h') < 24 ? (moment(item.created).format('h')+' 小时前完成训练') : moment(new Date(item.created)).format('YYYY/MM/DD hh:ss')+'完成训练'

            return (
                <div styleName="dynamic-item" key={item._id}>
                    <div styleName="item-photo" style={{backgroundImage: `url(${item.photo})`}}></div>
                    <div styleName="dynamic-content">
                        <div styleName="dynamic-desc">
                            <p>{item.content}</p>
                        </div>
                        <div>
                            <div styleName="dynamic-user">
                                <img styleName="item-avatar" src={item.author.avatar} alt=""/> {item.author.username} &nbsp; <span styleName="dynamic-time">{completeTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })
    }

    @autobind
    getTrainingWorkoutItem(workoutStep){
        let steps = this.state.workout.workouts[0].steps
        let stepList = new Map(steps.map((step) => {
            return [step._id, step]
        }))
        return workoutStep.map((stepItem, index) => {
            const Gender = this.state.user.gender.toLowerCase()
            let item = stepList.has(stepItem) ? stepList.get(stepItem) : {}
            let detail = item.exercise.videos[0] || {}
            return (
                <li key={item._id + index} styleName="line-item">
                    <Link to={`${this.props.router.getCurrentLocation().pathname}/${item._id}`}>
                        <div styleName="line-work-item">
                            <div styleName="work-item-cover" style={{backgroundImage: `url(${detail.thumbnail})`}}></div>
                            <p styleName="work-item-title">{item.exercise.name}</p>
                            <p className="fz12" styleName="work-item-desc">{Gender === 'm' ? item.mgroup : item.fgroup} x {item.type === 'times' ? Gender === 'm' ? item.mpergroup : item.fpergroup : Gender === 'm' ? item.mduration : item.mduration}<span className="fz12">{item.type === 'times' ? '次' : '"'}</span></p>
                        </div>
                        <div styleName="work-gap">休息 {item.gap}"</div>
                    </Link>
                </li>
            )
        })
    }

    @autobind
    getTrainingDetail(){
        const workContent = this.state.workout.workouts[0]

        return workContent.sections.map((item, index) => {
            return (
                <div key={item._id + index}>
                    <p styleName="line-title">{item.name}</p>
                    <ul styleName="training-line">
                        {this.getTrainingWorkoutItem(item.subSteps)}
                    </ul>
                </div>
            )
        })
    }

    @autobind
    handleToggleDetail(){
        const $workoutDetial = this.refs.workoutDetail
        if($workoutDetial.className.indexOf('show') > 0) {
            $workoutDetial.className = 'workout-introduce'
            this.setState({
                classBlur: 'workout-mask'
            })
            setTimeout(() => {
                $workoutDetial.style.display = 'none'
            },500)
        }else {
            this.setState({
                classBlur: 'workout-mask workout-blur-mask'
            })
            $workoutDetial.style.display = 'block'
            setTimeout(() => {
                $workoutDetial.className += ' show'
            },100)
        }
    }

    @autobind
    handleStartExercise(){
        console.info(this.state.workout.name)
        let winWorkout = new remote.BrowserWindow({
            'width': 1199,
            'height': 777,
            'title': this.state.workout.name,
            'center': true,
            //'alwaysOnTop': true,
        })
        winWorkout.loadURL('file://'+ require('path').resolve() +'/build/startExercise.html?planid='+ this.props.params.plan_id)
        winWorkout.on('close', () =>{
            winWorkout = null
        })
        winWorkout.show()
    }

    render(){
        const workout = this.state.workout
        if(workout._id) {
            const workContent = workout.workouts[0]

            return (
                <div ref="scrollContent" className="scroll-content">
                    <div styleName={this.state.classBlur}>
                        {/* 训练详细标注 */}
                        <section styleName="workout-header" style={{backgroundImage: `url(${workout.picture})`}}>
                            <div styleName="header-inner">
                                <p styleName="header-title">{workout.name}</p>

                                <p styleName="header-desc">{workout.description}</p>
                                <ul styleName="header-nav">
                                    <li className="pull-left"><Link onClick={this.handleToggleDetail}><span styleName="header-link"><span styleName="link-val"><i
                                        className={`iconfont icon-description fz14`}></i>训练说明</span></span></Link></li>
                                    <li><span styleName="header-sp"><span styleName="sp-desc">燃脂</span><br/><span
                                        className="fz18">{workout.calorie}</span>千卡</span></li>
                                    <li><span styleName="header-sp"><span styleName="sp-desc">时间</span><br/><span
                                        className="fz18">{workout.averageDuration}</span>分钟</span></li>
                                    <li><span styleName="header-sp"><span styleName="sp-desc">难度</span><br/><span
                                        className="fz18">K{workout.difficulty}</span></span></li>
                                </ul>
                            </div>
                        </section>

                        <section className="white-background">
                            <div styleName="list-nav">
                                <div styleName="nav-participation"><span
                                    className="fz10">总打卡次数</span><br/>{workContent.totalFinished}</div>
                                <ul styleName="complete-list">
                                    {this.getPioneerContent()}
                                </ul>
                                <Link styleName="show-more"><i className={`iconfont icon-more`}></i></Link>
                            </div>
                        </section>
                        {/* 训练详情 */}
                        <section styleName="training-content">
                            <div styleName="training-title">动作列表 <span
                                styleName="training-sp">{workContent.steps.length}个动作</span></div>
                            <div className="padding">
                                {this.getTrainingDetail()}
                            </div>
                        </section>
                        {/* 训练精选评论 */}
                        <section styleName="training-dynamic">
                            <div styleName="dynamic-title">训练成果</div>
                            <div>
                                {this.getWorkoutDynamic()}
                            </div>
                        </section>
                        <button styleName="button-start-training" onClick={this.handleStartExercise}>开始训练</button>
                    </div>
                    {/* 训练说明详情 */}
                    <section ref="workoutDetail" className="workout-introduce" style={{display: 'none'}}>
                        <article className="workout-introduce-inner">
                            <p styleName="header-title">{workout.name}</p>
                            <div className="article-wrap" dangerouslySetInnerHTML={{__html: this.state.workout.detail}}></div>
                        </article>
                        <button styleName="button-introduce-desc" onClick={this.handleToggleDetail}><i className={`iconfont icon-close`}></i></button>
                    </section>
                    {/* 训练动作详情 */}
                    {this.props.children}
                </div>
            )
        }
    }
}

export default AppWorkout