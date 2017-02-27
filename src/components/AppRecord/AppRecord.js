import React, { Component } from 'react'
import $http from '../../js/HttpRequest.js'
import autobind from 'autobind-decorator'
import CSSModules from 'react-css-modules'
import moment from 'moment'

import styles from '../../sass/appRecord.scss'

@CSSModules(styles)
class AppRecord extends Component{
    constructor(props){
        super(props)
    }

    @autobind
    componentWillMount(){
        $http.getFollowTimeline().then(() => {

        })
    }

    render(){
        return(
            <div className="scroll-content">
                <div>AppRecord</div>
            </div>
        )
    }
}

export default AppRecord