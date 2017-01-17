import React, { Component } from 'react'
import CSSModules from 'react-css-modules'

import styles from '../../../sass/appWorkouts.scss'

@CSSModules(styles)
class WorkoutCoordinates extends Component{
    constructor(props){
        super(props)
    }

    render(){
        const cover = this.props.data
        return (
            <figure styleName="exercise-figure">
                <div styleName="exercise-item">
                    <img styleName="exercise-pic" width="500" src={cover.url} alt=""/>
                    {/* 动作细节位置标识 */
                        cover.coordinates.map((item, index) => {
                            return (
                                <span key={item._id} style={{top: `${item.y * 100}%`, left: `${item.x * 100}%`}} styleName="exercise-coordinates">{index+1}</span>
                            )
                        })
                    }
                </div>
                <article>
                {/* 动作细节描述 */
                    cover.coordinates.map((item, index) => {
                        return (
                            <p key={item._id} styleName="exercise-tip">{index+1}. {item.tip}</p>
                        )
                    })
                }
                </article>
            </figure>
        )
    }
}

export default WorkoutCoordinates