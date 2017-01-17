import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import moment from 'moment'
import Utils from '../../../js/Utils.js'

import styles from '../../../sass/appWorkouts.scss'

import AppSlideContent from '../../../components/AppSlideContent.js'
import WorkoutCoordinates from './WorkoutCoordinates.js'

@CSSModules(styles)
class WorkoutDescription extends Component{
    constructor(props){
        super(props)
        const workouts = new Map(Utils.storage.get('workouts'))
        let desc = workouts.has(this.props.params.plan_id) ? workouts.get(this.props.params.plan_id) : {}
        if(desc._id){
            desc = desc.workouts[0].steps.filter((item) => {
                return item._id == this.props.params.desc_id
            })[0]
        }

        this.state = {
            workout: desc
        }
    }

    // 训练描述信息
    @autobind
    getDescriptionContent(){
        if(this.state.workout.exercise.description)
            return <article className="article-wrap" styleName="workout-desc-article" dangerouslySetInnerHTML={{__html: this.state.workout.exercise.description}}></article>
    }

    render(){
        return (
            <AppSlideContent>
                <div styleName="workout-desc-inner">
                    <video styleName="workout-desc-video" src={this.state.workout.exercise.videos[0].url} muted autoPlay loop></video>
                    <p styleName="workout-desc-title">{this.state.workout.exercise.name}</p>
                    {this.getDescriptionContent()}
                    <h4 styleName="workout-exercise-title">细节图示</h4>
                    <article styleName="workout-desc-figure">
                        {
                            this.state.workout.exercise.covers.map((cover) => {
                                return <WorkoutCoordinates key={cover._id} data={cover} />
                            })
                        }
                    </article>
                </div>
            </AppSlideContent>
        )
    }
}

export default WorkoutDescription