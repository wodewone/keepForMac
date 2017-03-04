import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import moment from 'moment'
import Utils from '../../js/Utils.js'

import styles from '../../sass/appWorkouts.scss'

import AppSlideContent from '../../components/AppSlideContent.js'

@CSSModules(styles)
class RecordContent extends Component{
    constructor(props){
        super(props)

        this.state = {
            name: this.props.params.tag_name
        }
    }

    componentWillMount(){
        console.info(this.state.name)
    }

    render(){
        return (
            <AppSlideContent>
                <webview src={`http://www.gotokeep.com/hashtag/${this.state.name}`}></webview>
            </AppSlideContent>
        )
    }
}

export default RecordContent