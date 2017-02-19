import '../sass/app.scss'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import autobind from 'autobind-decorator'
import CSSModules from 'react-css-modules'
import Utils from './Utils.js'
import moment from 'moment'
import styles from '../sass/moduleExercise.scss'
import $http from './HttpRequest.js'

import WorkoutCoordinates from '../components/AppTraining/workouts/WorkoutCoordinates.js'

import {remote} from 'electron'

@CSSModules(styles, {allowMultiple: true})
class ModuleExercise extends Component{
    constructor(props){
        super(props)
        const workouts = Utils.storage.get('workouts') || []
        const planId = location.search.substring(location.search.indexOf('=')+1)

        this.state = {
            classTimeout: '',
            classToggle: '',

            user: Utils.storage.get('userData') || {},
            workout: !workouts.length ?
                {} :
                !new Map(workouts).has(planId) ?
                    {} :
                    new Map(workouts).get(planId),
            exercises: [],
            currentProceed: 0,
            countdown: 0,
            currentGroupTime: 0,
            currentGroupDuration: 0,
            timeoutTip: Utils.storage.get('timeoutTip'),
            timeoutGap: 0,
            totalDuration: 0,
            statisticDuration: 0,       // 总时长（包括休息时间和报读时间以及训练时间）
            isEnd: ''
        }

        this.totalStart = false
        this.vStart = false
        this.statisticGroup = []
        this.groupAudio = []
        this.toNextCallback = null,       // 主音频播放回调

        // setTimeout Or setInterval
        this.timeoutGapId = 0,            // 休息时间
        this.timeoutCountdownId = 0,      // 开始倒计时
        this.recordId = 0,                // 统计单项运行状态
        this.commentaryId = 0             // 提示语
    }

    static getSoundTips(name){
        return `file://${$dirname}/sounds/${name}`
    }
    static getSoundNumber(name){
        return `file://${$dirname}/number/N${name}.mp3`
    }
    static makeNumOrder(index){
        return index < 1000 ?
            index < 100 ?
                index < 10 ? '00'+ index : '0'+ index
                : '0'+ index
            : index
    }

    @autobind
    componentDidMount(){
        console.info(this.state.workout)

        remote.getCurrentWindow().removeAllListeners()
        remote.getCurrentWindow().on('blur', (e) => {
            this.handleMainPause()
        }).on('focus', (e) => {
            this.handleMainPlay()
        })

        const exercise = this.state.workout.workouts[0]
        const videos = exercise.steps

        let totalDuration = 0
        let list = videos.map((item) => {
            let single = {}
            single.name = item.exercise.name
            single.gap = item.gap
            single.video = item.exercise.videos[0]
            single.videoName = single.video.url.substring(single.video.url.lastIndexOf('/')+1, single.video.url.indexOf('.mp4'))
            single.audio = item.exercise.audio
            single.audioName = single.audio.substring(single.audio.lastIndexOf('/')+1, single.audio.indexOf('.mp3'))
            single.type = item.type
            single.description = item.exercise.description
            single.covers = item.exercise.covers
            single.exerciseId = item.exercise._id

            // 根据性别划分锻炼难度
            if(this.state.user.gender.toLowerCase() === 'm'){
                single.group = item.mgroup
                single.groupTime = item.mpergroup
                single.groupDuration = item.mduration
            }else{
                single.group = item.fgroup
                single.groupTime = item.fpergroup
                single.groupDuration = item.fduration
            }

            // 训练时提醒
            if(item.commentaryTraining.length){
                if(item.commentaryTraining[0].gender === this.state.user.gender)
                    single.commentary = item.commentaryTraining[0].sets
                else
                    single.commentary = item.commentaryTraining[1].sets
            }else{
                single.commentary = null
            }

            totalDuration += single.groupDuration

            return single
        })

        // 统计项目总时间
        this.setState({
            statisticDuration: totalDuration
        })

        this.setState({
            exercises: list
        }, this.startExercise)
    }

    @autobind
    componentWillUnmount(){
        clearTimeout(this.timeId)
    }

    @autobind
    startExercise(){
        const curAction = this.state.exercises[this.state.currentProceed]

        console.info(curAction)

        this.setState({
            countdown: 4
        })

        // 判断是否第一组
        if(this.state.currentProceed === 0)
            this.groupAudio.push(ModuleExercise.getSoundTips('g_2_first_motion.mp3'))
        // 是否是最后一组
        else if(this.state.currentProceed === this.state.exercises.length -1)
            this.groupAudio.push(ModuleExercise.getSoundTips('g_14_last_motion.mp3'))
        else
            this.groupAudio.push(ModuleExercise.getSoundTips('g_13_next_motion.mp3'))

        // 项目名
        this.groupAudio.push(curAction.audio)

        // 组
        this.groupAudio.push(ModuleExercise.getSoundTips('one_group.mp3'))

        if(this.state.exercises.group > 1)
            this.groupAudio.push(ModuleExercise.getSoundTips('g_4_group.mp3'))

        // 单组次数/时间
        if(curAction.type === 'times') {
            this.groupAudio.push(ModuleExercise.getSoundNumber(ModuleExercise.makeNumOrder(curAction.groupTime)))
            this.groupAudio.push(ModuleExercise.getSoundTips('g_6_time.mp3'))
        } else {
            this.groupAudio.push(ModuleExercise.getSoundNumber(ModuleExercise.makeNumOrder(curAction.groupDuration)))
            this.groupAudio.push(ModuleExercise.getSoundTips('seconds.mp3'))
        }

        this.totalStart = true
        this.initTimerAuthor().play()
        this.componentAudio().setSrc(this.groupAudio.shift()).play()
    }

    // 项目开始倒计时
    @autobind
    beginCountdown(){
        return {
            play: () => {
                if(this.totalStart) {
                    if (this.state.countdown > 0) {
                        this.timeoutCountdownId = setTimeout(() => {
                            this.setState({
                                countdown: this.state.countdown - 1
                            }, () => {
                                this.componentAudio().setSrc(ModuleExercise.getSoundNumber('00' + this.state.countdown)).play()
                                this.beginCountdown().stop().play()
                            })
                        }, 1000)
                    } else {
                        this.timeoutCountdownId && clearTimeout(this.timeoutCountdownId)
                        this.timeoutCountdownId = 0
                        this.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('g_9_go.mp3')).play()
                        this.timeoutCountdownId = setTimeout(() => {
                            this.vStart = true
                            this.recordExerciseConfig().play()
                            this.componentVideo().reset()

                            clearTimeout(this.timeoutCountdownId)
                            this.timeoutCountdownId = 0
                        }, 1000)
                    }
                }else{
                    this.timeoutCountdownId && clearTimeout(this.timeoutCountdownId)
                    this.timeoutCountdownId = 0
                }
            },
            stop: () => {
                this.timeoutCountdownId && clearTimeout(this.timeoutCountdownId)
                this.timeoutCountdownId = 0

                return this.beginCountdown()
            }
        }
    }


    @autobind
    initTimerAuthor(){
        return {
            play: () => {
                this.timerId = setTimeout(() => {
                    if (this.totalStart){
                        this.setState({
                            totalDuration: this.state.totalDuration + 1,
                        })
                        if(this.vStart){
                            // 统计单项运动时间
                            this.setState({
                                currentGroupDuration: this.state.currentGroupDuration + 1
                            })
                            // 如果类型不是报次,则读秒
                            if(this.state.exercises[this.state.currentProceed].type !== 'times')
                                this.componentAudio().setSrc(ModuleExercise.getSoundTips('timer.mp3')).play()
                        }
                        this.initTimerAuthor().play()
                    } else {
                        this.initTimerAuthor().stop()
                    }
                }, 1000)
            },
            stop: () => {
                this.timerId && clearTimeout(this.timerId)
                this.timerId = 0
            }
        }
    }

    // 统计单项目运行时间
    @autobind
    recordExerciseConfig(){
        return {
            play: () => {
                let timeSpeed = 1000
                if(this.state.exercises[this.state.currentProceed].groupTime > 0)
                    timeSpeed = this.state.exercises[this.state.currentProceed].groupDuration / this.state.exercises[this.state.currentProceed].groupTime * 1000
                this.setState({
                    currentGroupTime: this.state.currentGroupTime + 1
                }, () => {
                    if (this.state.exercises[this.state.currentProceed].type === 'times')
                        this.componentAudio().setSrc(ModuleExercise.getSoundNumber(ModuleExercise.makeNumOrder(this.state.currentGroupTime))).play()

                    this.recordId = setTimeout(() => {
                        if (this.state.exercises[this.state.currentProceed].type === 'times')
                            if(this.state.currentGroupTime < this.state.exercises[this.state.currentProceed].groupTime) {
                                this.recordExerciseConfig().play()
                            } else {
                                if (this.state.exercises[this.state.currentProceed].gap) {
                                    this.resetAllState()
                                    this.componentTimeout().rest(this.state.exercises[this.state.currentProceed].gap)
                                } else
                                    this.handleJumpNext()
                            }
                        else
                            if(this.state.currentGroupDuration < this.state.exercises[this.state.currentProceed].groupDuration) {
                                this.recordExerciseConfig().play()
                            } else {
                                if (this.state.exercises[this.state.currentProceed].gap) {
                                    this.resetAllState()
                                    this.componentTimeout().rest(this.state.exercises[this.state.currentProceed].gap)
                                } else
                                    this.handleJumpNext()
                            }
                    }, timeSpeed)
                })
            },
            stop: () => {
                this.recordId && clearTimeout(this.recordId)
                this.recordId = 0
            },
            over: () => {
                this.recordExerciseConfig().stop()

                if(this.vStart)
                    this.statisticGroup.push({
                        name: this.state.exercises[this.state.currentProceed].name,
                        type: this.state.exercises[this.state.currentProceed].type,
                        exercise: this.state.exercises[this.state.currentProceed].exerciseId,
                        actualSec: 20,
                        totalSec: 20,
                    })
                return true
            }
        }
    }

    // 主视频对象操作
    @autobind
    componentVideo(){
        let masterVideo = this.refs.masterVideo

        return {
            pause: () => {
                masterVideo.pause()
                return this.componentVideo()
            },
            play: () => {
                masterVideo.play()
                return this.componentVideo()
            },
            reset: () => {
                masterVideo.load()
                return this.componentVideo()
            },
            setSrc: (src) => {
                masterVideo.src = src
                return this.componentVideo()
            },
            stop: () => {
                masterVideo.loop = false
            },
            goPlay: () => {
                // 项目开始
                if(this.vStart) {
                    // 循环播放
                    masterVideo.play()
                }
                //else if(this.state.countdown > -1){
                //    this.refs.masterVideo.play()
                //}
                return true
            }
        }
    }

    // 主音频对象操作
    @autobind
    componentAudio(){
        let masterAudio = this.refs.masterAudio

        return {
            togglePlay: () => {
                if(masterAudio.volume)
                    masterAudio.volume = 0
                else
                    masterAudio.volume = 1
            },
            pause: () => {
                masterAudio.pause()
                return this.componentAudio()
            },
            play: () => {
                if(masterAudio.src)
                    masterAudio.play()
                else
                    this.componentAudio().toNext()
                return this.componentAudio()
            },
            replay: () => {
                masterAudio.load()
                return this.componentAudio()
            },
            stop: () => {
                // 避免重复报读
                //masterAudio.currentTime = masterAudio.duration * 0.99
                masterAudio.src = ''
                this.timeoutCountdownId && clearTimeout(this.timeoutCountdownId)
                //masterAudio.pause()

                return this.componentAudio()
            },
            setSrc: (src) => {
                //console.info('this.refs.masterAudio', this.refs.masterAudio)
                masterAudio.src = src
                return this.componentAudio()
            },
            toNext: () => {
                if(this.toNextCallback && typeof this.toNextCallback === 'function'){
                    this.toNextCallback()
                    this.toNextCallback = null
                    return true
                }
                if(this.totalStart) {
                    if (this.groupAudio.length) {
                        // 开始读秒
                        //if(this.groupAudio.length <= 4 && !this.vStart){
                        //    // 延迟读秒时间
                        //    this.timeoutCountdownId = setTimeout(() => {
                        //        masterAudio.src = this.groupAudio.shift()
                        //        masterAudio.play()
                        //        this.beginCountdown()
                        //    }, 660)
                        //    return true
                        //}
                        masterAudio.src = this.groupAudio.shift()
                        masterAudio.play()
                        return true
                    } else {
                        if(this.state.countdown > 3)
                            this.beginCountdown().play()
                    }
                }
            }
        }
    }

    // 锻炼时提示语 (*未完* | 本地缓存、解压、目录存放)
    @autobind
    commentaryTrainingAudio(){
        let branchAudio = this.refs.branchAudio
        return {
            start: () => {
                const commentary = this.state.exercises[this.state.currentProceed].commentary
                if(commentary){
                    commentary.forEach((item) => {
                        this.commentaryId = setTimeout(() => {
                            this.commentaryTrainingAudio().play(item.id)
                        }, item.time * 1000)
                    })
                }
            },
            play: (src) => {
                branchAudio.src = src
                return this.commentaryTrainingAudio()
            },
            pause: () => {
                branchAudio.pause()
                return this.commentaryTrainingAudio()
            }
        }
    }

    // 视频音频开关
    @autobind
    componentMaster(){
        return {
            pause: () => {
                this.setState({
                    totalStart: false,
                }, () => {
                    if(this.state.countdown > 0)
                        this.beginCountdown().stop()
                    this.componentVideo().pause()
                    this.componentAudio().pause()
                })
            },
            play: () => {
                this.setState({
                    totalStart: true,
                }, () => {
                    this.componentVideo().play()
                    this.componentAudio().play()
                    if(!this.groupAudio.length && this.state.countdown > 0)
                        this.beginCountdown().play()
                })
            }
        }
    }

    //休息时间
    @autobind
    componentTimeout(){
        return {
            show: () => {
                this.setState({
                    classTimeout: 'show'
                })
                return true
            },
            hide: () => {
                this.setState({
                    classTimeout: ''
                })
                return true
            },
            rest: (time) => {
                this.setState({
                    timeoutGap: time,
                    classTimeout: 'show'
                }, () => {
                    console.info(this.timeoutGapId)
                    if(this.timeoutGapId) return
                    this.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('g_10_take_a_rest.mp3')).play()
                    this.timeoutGapId = setInterval(() => {
                        if (this.state.timeoutGap > 0) {
                            this.setState({
                                timeoutGap: this.state.timeoutGap - 1
                            })
                        } else {
                            clearInterval(this.timeoutGapId)
                            this.timeoutGapId = 0
                            this.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('g_11_rest_end.mp3')).play()
                            this.toNextCallback = this.handleJumpNext
                        }
                    }, 1000)
                })
                return true
            },
            stop: () => {
                this.timeoutGapId && clearInterval(this.timeoutGapId)
                this.componentTimeout().hide()
                return true
            }
        }
    }

    @autobind
    resetAllState(){
        this.recordExerciseConfig().over()      // 保存当前项目值并重置
        this.totalStart = false
        this.vStart = false
        this.groupAudio = []                // 声音重置

        this.initTimerAuthor().stop()       // 停止时间统计
        this.componentMaster().pause()      // 终止所有视频、音频播放
        this.componentTimeout().stop()      // 销毁休息状态
    }

    @autobind
    handleSounds(){
        this.componentAudio().togglePlay()
    }

    @autobind
    handleMainPause(){
        this.initTimerAuthor().stop()
        if(this.vStart)
            this.recordExerciseConfig().stop()
        this.componentTimeout().show()
        this.componentMaster().pause()
        this.setState({
            classToggle: 'gather'
        })
    }
    @autobind
    handleMainPlay(){
        this.setState({
            classToggle: ''
        })
        this.componentTimeout().hide()
        this.componentMaster().play()
        this.initTimerAuthor().play()
        if(this.vStart)
            this.recordExerciseConfig().play()
    }

    // 总开关事件
    @autobind
    handleVideoToggle(){
        if(this.state.classToggle) {        // play
            this.handleMainPlay()
        }else {                             // pause
            this.handleMainPause()
        }
    }

    // 上一个！
    @autobind
    handleJumpPrev(){
        this.resetAllState()
        this.setState({                     // 重置组数据，回调进行上一次
            currentProceed: this.state.currentProceed > 1 ? this.state.currentProceed - 1 : 0,
            currentGroupTime: 0,
            currentGroupDuration: 0,
            timeoutGap: 0
        },this.startExercise)
    }

    // 下一个！！
    @autobind
    handleJumpNext(){
        this.resetAllState()
        if(this.state.currentProceed < this.state.exercises.length - 1) {
            this.setState({                 // 重置组数据，回调开始下一次
                currentProceed: this.state.currentProceed + 1,
                currentGroupTime: 0,
                currentGroupDuration: 0,
                timeoutGap: 0
            }, this.startExercise)
        }else{
            this.componentVideo().stop()
            this.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('countdownend.mp3')).play()
            this.toNextCallback = () => this.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('g_16_well_done.mp3')).play()
            $http.completeExercise()
            this.setState({
                isEnd: 'active'
            })
        }
    }

    @autobind
    getVideoContent(){
        if(this.state.exercises.length)
            return  (
                <section styleName="exercise-video">
                    <div styleName="exercise-inner">
                        <div styleName={`video-wrap ${this.state.classTimeout}`}>
                            <video ref="masterVideo" onEnded={this.componentVideo().goPlay} muted autoPlay loop src={this.state.exercises[this.state.currentProceed].video.url}></video>
                        </div>
                        <aside styleName="command-layer"></aside>
                        <aside styleName="info-layer">
                            <div styleName="countdown-times" disabled={this.state.countdown > 3}>
                                {/* 开始倒计时 */}
                                <div className="fz18" hidden={this.state.countdown <= 0}>{this.state.countdown > 3 ? 3 : this.state.countdown}</div>
                                {/* GO! */}
                                <div className="fz18" hidden={this.state.countdown > 0 || this.state.currentGroupTime}>GO!</div>
                                {/* 显示次数 */}
                                <div className="fz14" hidden={this.state.exercises[this.state.currentProceed].type !== 'times' && this.state.currentGroupTime}>{this.state.currentGroupTime}/{this.state.exercises[this.state.currentProceed].groupTime}</div>
                                {/* 显示时间 */}
                                <div className="fz14" hidden={this.state.exercises[this.state.currentProceed].type === 'times' && this.state.currentGroupDuration}>{this.state.currentGroupDuration}/{this.state.exercises[this.state.currentProceed].groupDuration}"</div>
                            </div>
                            <span styleName="timeout-total-time">{moment(new Date(this.state.totalDuration * 1000)).format('mm:ss')}</span>
                        </aside>
                        <aside styleName={`timeout-layer ${this.state.classTimeout}`}>
                            <div styleName="timeout-tips">
                                <div><i className="iconfont icon-symbol fz24"></i></div>
                                <p styleName="timeout-title">{this.state.timeoutTip.content}</p>
                                <p styleName="timeout-author">——{this.state.timeoutTip.author}</p>
                            </div>
                            <button hidden={!this.state.timeoutGap} onClick={this.handleJumpNext} styleName="button-timeout">{this.state.timeoutGap}</button>
                        </aside>
                        {/* 暂停、继续按钮 */}
                        <button hidden={this.state.timeoutGap} styleName={`button-toggle ${this.state.classToggle}`} onClick={this.handleVideoToggle}><i className={`iconfont ${this.state.classToggle ? 'icon-play' : 'icon-pause'}`}></i></button>
                        <div>
                            <span styleName={`arrow-top ${this.state.classToggle}`}></span>
                            <span styleName={`arrow-right ${this.state.classToggle}`}></span>
                            <span styleName={`arrow-bottom ${this.state.classToggle}`}></span>
                            <span styleName={`arrow-left ${this.state.classToggle}`}></span>
                        </div>
                    </div>
                </section>
            )
    }


    @autobind
    getFinishContent() {
        return (
            <div styleName={`finish-page ${this.state.isEnd}`}>
                <div styleName="finish-inner">
                    <div styleName="finish-title">
                        <img src={require('../assets/images/great.png')} alt=""/>

                        <p className="padding">恭喜你完成训练</p>
                    </div>
                    <div styleName="finish-detail">
                        <div className="text-left" styleName="col">
                            时长 <br/> <span className="fz24">{this.state.totalDuration > 60 ? Math.floor(this.state.totalDuration / 60) : '<1'}</span>分
                        </div>
                        <div className="text-center" styleName="col">
                            动作 <br/> <span className="fz24">{this.statisticGroup.length}</span>组
                        </div>
                        <div className="text-right" styleName="col">
                            消耗 <br/> <span className="fz24">{this.state.totalDuration}</span>千卡
                        </div>
                    </div>
                    <ul styleName="finish-actions">
                        {
                            this.statisticGroup.length && this.statisticGroup.map((item, index) => {
                                return (
                                    <li key={index}>
                                        <div className="text-left" styleName="col">{item.name}</div>
                                        <div className="text-right" styleName="col">{moment(new Date(item.totalSec * 1000)).format('mm:ss')}</div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                    <div styleName="finish-feel">
                        <textarea styleName="feel-content" placeholder="记下本次训练的感受和心得"></textarea>
                    </div>
                </div>
            </div>
        )
    }

    render(){
        return (
            <div styleName="exercise-container">
                <div styleName={`exercise-page ${this.state.isEnd}`}>
                    <div styleName="exercise-header">
                        <p styleName="exercise-title">{this.state.currentProceed+1}/{this.state.exercises.length} {this.state.exercises.length && this.state.exercises[this.state.currentProceed].name}</p>
                        <div styleName="title-progress-wrap">
                            {
                                this.state.exercises.length && this.state.exercises.map((item, index) => {
                                    return <div key={index} styleName="progress-item" style={{width: `${item.groupDuration * item.group / this.state.statisticDuration * 100}%`}}></div>
                                })
                            }
                        </div>
                        <button disabled={this.state.currentProceed <= 0} onClick={this.handleJumpPrev} styleName="button-header button-header-prev"><i className={`iconfont fz24 icon-forward`}></i></button>
                        <button disabled={this.state.currentProceed >= this.state.exercises.length-1} onClick={this.handleJumpNext} styleName="button-header button-header-next"><i className={`iconfont fz24 icon-goback`}></i></button>
                    </div>
                    <section styleName="content-left" ref="contentLeft">
                        <div styleName="content-inner-flex">
                            <div className="padding">
                                {this.getVideoContent()}
                            </div>
                            <div styleName="coordinates-flex">
                                <div styleName="content-coordinates">
                                    {
                                        this.state.exercises.length && this.state.exercises[this.state.currentProceed].covers.map((cover) => {
                                            return <WorkoutCoordinates key={cover._id} data={cover} />
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </section>
                    <section styleName="content-right" ref="contentRight">
                        <div styleName="content-scroll">
                            {
                                this.state.exercises.length && <article className="article-wrap" dangerouslySetInnerHTML={{__html: this.state.exercises[this.state.currentProceed].description}}></article>
                            }
                        </div>
                    </section>
                    <button styleName="button-toggle-sound" onClick={this.handleSounds}>声音</button>
                    <figure styleName="other-res">
                        <audio ref="masterAudio" onEnded={this.componentAudio().toNext} src=""></audio>
                        <audio ref="branchAudio" src=""></audio>
                    </figure>
                </div>
                {this.state.isEnd && this.getFinishContent()}
            </div>
        )
    }
}

const container = document.createElement('div')
container.id = 'container'
container.className = 'container'
document.querySelector('body').appendChild(container)

ReactDOM.render(
    <ModuleExercise />,
    document.getElementById('container')
)