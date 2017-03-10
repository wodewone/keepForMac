import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'

import styles from '../../sass/appWorkouts.scss'

import AppSlideContent from '../../components/AppSlideContent.js'

@CSSModules(styles)
class ArticleContent extends Component{
    constructor(props){
        super(props)

        this.state = {
            name: this.props.params.tag_name
        }
    }

    render(){
        return (
            <AppSlideContent>
                <iframe className="slide-content-wrap" src={`http://www.gotokeep.com/hashtag/${this.state.name}`}></iframe>
            </AppSlideContent>
        )
    }
}

export default ArticleContent