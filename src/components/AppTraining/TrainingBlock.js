import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { Link } from 'react-router'

import styles from '../../sass/appTraining.scss'

@CSSModules(styles)
class TrainingBlock extends Component{
    constructor(props){
        super(props)
    }

    @autobind
    getLastTrainingDate(datetime){
        if(datetime) {
            const days = moment().diff(moment(datetime), 'd')
            const hours = moment().diff(moment(datetime), 'h')
            if(days > 100)
                return ''

            if(days >= 1)
                return '上次训练 '+ days +' 天前'

            if(hours >= 1)
                return hours +' 小时前训练过'

            return '刚刚训练过'
        }else{
            return ''
        }
    }

    render(){
        let workout = this.props.data
        return(
            <Link to={`/plan/${workout.id}`} styleName="training-block" style={{backgroundImage:`url(${workout.picture})`}}>
                <p styleName="training-block-title">{workout.name}</p>
                <p styleName="training-block-desc">{this.getLastTrainingDate(workout.lastTrainingDate)}</p>
                <span styleName="training-block-info">
                    <span styleName="block-info-time">{workout.averageDuration}分钟</span><span styleName="block-info-time">完成{workout.curWorkoutFinishTimes}次</span>
                </span>
            </Link>
        )
    }
}

export default TrainingBlock