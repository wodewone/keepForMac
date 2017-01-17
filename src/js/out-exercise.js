import '../sass/app.scss'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import autobind from 'autobind-decorator'
import CSSModules from 'react-css-modules'
import Utils from './Utils.js'

import styles from '../sass/moduleExercise.scss'

import WorkoutCoordinates from '../components/AppTraining/workouts/WorkoutCoordinates.js'

const container = document.createElement('div')
container.id = 'container'
container.className = 'container'
document.querySelector('body').appendChild(container)

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
            timeoutGap: 0
        }
        this.statisticGroup = []
        this.statisticDuration = 0      // 总时长
        this.vStart = false
        this.groupAudio = []
        this.toNextCallback = null      // 主音频播放回调

        // setTimeout Or setInterval
        this.timeoutGapId = 0           // 休息时间
        this.timeoutCountdownId = 0     // 开始倒计时
        this.itemDurationId = 0         // 单项目运行时间
        this.commentaryId = 0           // 提示语
    }

    @autobind
    componentDidMount(){
        console.info(this.state.workout)
        const exercise = this.state.workout.workouts[0]
        const videos = exercise.steps

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

            console.info(this.state.user.gender)
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

            // 统计项目总时间
            this.statisticDuration += single.groupDuration

            return single
        })

        this.setState({
            exercises: list
        }, this.startExercise)
    }

    @autobind
    componentWillUnmount(){
        clearTimeout(this.timeId)
    }

    static getSoundTips(name){
        return 'http://localhost:3000/sounds/' + name
    }
    static getSoundNumber(name){
        return 'http://localhost:3000/number/N' + name +'.mp3'
    }
    static makeNumOrder(index){
        return index < 1000 ?
            index < 100 ?
                index < 10 ? '00'+ index : '0'+ index
                : '0'+ index
            : index
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

        // 倒计时
        this.groupAudio.push(ModuleExercise.getSoundNumber('003'))
        this.groupAudio.push(ModuleExercise.getSoundNumber('002'))
        this.groupAudio.push(ModuleExercise.getSoundNumber('001'))
        this.groupAudio.push(ModuleExercise.getSoundTips('g_9_go.mp3'))

        this.componentAudio().setSrc(this.groupAudio.shift()).play()
    }

    // 项目开始倒计时
    @autobind
    beginCountdown(){
        this.setState({
            countdown: this.state.countdown - 1
        }, () => {
            if(this.state.countdown < 1){
                this.refs.masterVideo.loop = false
                this.vStart = true
                this.recordExerciseConfig().start()
                this.componentVideo().reset()
            }
        })
    }

    // 统计单项目运行时间
    @autobind
    recordExerciseConfig(){
        return {
            start: () => {
                this.itemDurationId = setInterval(() => {

                    console.info('itemDurationId')

                    if(this.state.currentGroupDuration < this.state.exercises[this.state.currentProceed].groupDuration) {
                        // 统计时间
                        this.setState({
                            currentGroupDuration: this.state.currentGroupDuration + 1
                        })
                        // 如果类型不是报次,则读秒
                        if (this.state.exercises[this.state.currentProceed].type !== 'times')
                            this.componentAudio().setSrc(ModuleExercise.getSoundTips('timer.mp3')).play()
                    } else {
                        this.recordExerciseConfig().pause()
                        if(this.vStart) {
                            if (this.state.exercises[this.state.currentProceed].gap) {
                                this.resetAllState()
                                this.componentTimeout().rest(this.state.exercises[this.state.currentProceed].gap)
                            } else
                                this.handleJumpNext()
                        }
                    }
                }, 1000)
                return true
            },
            pause: () => {
                this.itemDurationId && clearInterval(this.itemDurationId)
                return true
            },
            stop: () => {
                this.recordExerciseConfig().pause()
                this.statisticGroup.push({
                    title: this.state.exercises[this.state.currentProceed].name,
                    duration: this.state.currentGroupDuration
                })
                this.setState({
                    currentGroupDuration: 0
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
            loop: () =>{
                masterVideo.loop = true
            },
            goPlay: () => {
                // 项目开始
                if(this.vStart) {
                    // 循环播放
                    masterVideo.play()
                    // 如果项目为次数类型则执行
                    // 当没有达到指定次数则计数报次
                    // 否则结束当前项目并显示休息
                    if(this.state.exercises[this.state.currentProceed].type === 'times') {
                        if (this.state.currentGroupTime < this.state.exercises[this.state.currentProceed].groupTime) {
                            this.setState({
                                currentGroupTime: this.state.currentGroupTime + 1
                            })
                            if (this.state.exercises[this.state.currentProceed].type === 'times') {
                                this.componentAudio().setSrc(ModuleExercise.getSoundNumber(ModuleExercise.makeNumOrder(this.state.currentGroupTime + 1))).play()
                            }
                        } else {
                            this.resetAllState()
                            let gapTime = this.state.exercises[this.state.currentProceed].gap
                            gapTime && this.componentTimeout().rest(gapTime)
                        }
                    }
                }
                //else if(this.state.countdown > -1){
                //    this.refs.masterVideo.play()
                //}
                return true
            },
            getCount: () => {
                return this.state.currentGroupTime
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
                    console.info('tonext')
                    this.toNextCallback()
                    this.toNextCallback = null
                    return true
                }
                if(this.groupAudio.length) {
                    // 开始读秒
                    if(this.groupAudio.length <= 4 && !this.vStart){
                        // 延迟读秒时间
                        this.timeoutCountdownId = setTimeout(() => {

                            console.info('timeoutCountdownId')

                            masterAudio.src = this.groupAudio.shift()
                            masterAudio.play()
                            this.beginCountdown()
                        }, 660)
                        return true
                    }
                    masterAudio.src = this.groupAudio.shift()
                    masterAudio.play()
                    return true
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
                this.componentVideo().pause()
                this.componentAudio().stop()
                // 暂停统计
                this.recordExerciseConfig().pause()
            },
            play: () => {
                this.componentVideo().play()
                this.componentAudio().play()
                // 继续统计
                this.recordExerciseConfig().start()
            }
        }
    }

    /**
     * 休息时间
     * @param time Number | Boolean
     *      Number - 显示 timeout-layer 和休息时间
     *      Boolean - 是否显示 timeout-layer
     *          true 显示
     *          false 隐藏
     */
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
                    this.componentAudio().setSrc(ModuleExercise.getSoundTips('g_10_take_a_rest.mp3')).play()
                    this.timeoutGapId = setInterval(() => {

                        console.info('timeoutGapId')

                        if (this.state.timeoutGap) {
                            this.setState({
                                timeoutGap: this.state.timeoutGap - 1
                            })
                        } else {
                            clearInterval(this.timeoutGapId)
                            this.componentAudio().setSrc(ModuleExercise.getSoundTips('g_11_rest_end.mp3')).play()
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
    getVideoContent(){
        if(this.state.exercises.length)
            return  (
                <section styleName="exercise-video">
                    <div styleName="exercise-inner">
                        <video ref="masterVideo" onEnded={this.componentVideo().goPlay} muted autoPlay loop src={this.state.exercises[this.state.currentProceed].video.url}></video>
                        <aside styleName="command-layer"></aside>
                        <aside styleName="info-layer">
                            <div styleName="countdown-times" disabled={this.state.countdown > 3}>
                                {/* 开始倒计时 */}
                                <div className="fz18" hidden={this.state.countdown <= 0}>{this.state.countdown > 3 ? 3 : this.state.countdown}</div>
                                {/* GO! */}
                                <div className="fz18" hidden={this.state.countdown > 0 || this.vStart}>GO!</div>
                                {/* 显示次数 */}
                                <div className="fz14" hidden={this.state.exercises[this.state.currentProceed].type !== 'times' || !this.vStart}>{this.state.currentGroupTime}/{this.state.exercises[this.state.currentProceed].groupTime}</div>
                                {/* 显示时间 */}
                                <div className="fz14" hidden={this.state.exercises[this.state.currentProceed].type === 'times' || !this.vStart}>{this.state.currentGroupDuration}/{this.state.exercises[this.state.currentProceed].groupDuration}"</div>
                            </div>
                        </aside>
                        <aside styleName={`timeout-layer ${this.state.classTimeout}`}>
                            <div styleName="timeout-tips">
                                <p styleName="timeout-title">{this.state.timeoutTip.content}</p>
                                <p styleName="timeout-author">——{this.state.timeoutTip.author}</p>
                            </div>
                            <div hidden={!this.state.timeoutGap}>
                                <button onClick={this.handleJumpNext} styleName="button-timeout">{this.state.timeoutGap}</button>
                            </div>
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
    resetAllState(){
        this.groupAudio = []
        this.componentMaster().pause()      // 终止所有视频、音频播放
        if(this.vStart)
            this.recordExerciseConfig().stop()  // 保存当前项目值并重置为 0
        this.vStart = false                 // 终止当前项目
        this.componentTimeout().stop()      // 销毁休息状态
        this.refs.masterVideo.loop = true
    }

    @autobind
    handleSounds(){
        this.componentAudio().togglePlay()
    }

    // 总开关事件
    @autobind
    handleVideoToggle(){
        if(this.state.classToggle) {        // pause
            this.setState({
                classToggle: ''
            })
            this.componentTimeout().hide()
            this.componentMaster().play()
        }else {                             // play
            this.componentTimeout().show()
            this.setState({
                classToggle: 'gather'
            })
            this.componentMaster().pause()
        }
    }

    // 上一个！
    @autobind
    handleJumpPrev(){
        this.resetAllState()
        this.setState({                     // 重置组数据，回调进行上一次
            currentProceed: this.state.currentProceed > 1 ? this.state.currentProceed - 1 : 0,
            currentGroupTime: 0
        },this.startExercise)
    }

    // 下一个！！
    @autobind
    handleJumpNext(){
        this.resetAllState()
        if(this.state.currentProceed < this.state.exercises.length - 1) {
            this.setState({                 // 重置组数据，回调开始下一次
                currentProceed: this.state.currentProceed + 1,
                currentGroupTime: 0
            }, this.startExercise)
        }else{
            this.componentAudio().setSrc(ModuleExercise.getSoundTips('countdownend.mp3')).play()
            this.toNextCallback = () => this.componentAudio().setSrc(ModuleExercise.getSoundTips('g_16_well_done.mp3')).play()
            console.info(this.statisticGroup)
        }
    }

    render(){
        return (
            <div styleName="exercise-container">
                <div styleName="exercise-header">
                    <p styleName="exercise-title">{this.state.currentProceed+1}/{this.state.exercises.length} {this.state.exercises.length && this.state.exercises[this.state.currentProceed].name}</p>
                    <div styleName="title-progress-wrap">
                        {
                            this.state.exercises.length && this.state.exercises.map((item, index) => {
                                return <div key={index} styleName="progress-item" style={{width: `${item.groupDuration * item.group / this.statisticDuration * 100}%`}}></div>
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
                <div styleName=""></div>
            </div>
        )
    }
}

ReactDOM.render(
    <ModuleExercise />,
    document.getElementById('container')
)