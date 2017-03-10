import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import moment from 'moment'
import $http from '../../js/HttpRequest.js'

import styles from '../../sass/appWorkouts.scss'

import AppSlideContent from '../../components/AppSlideContent.js'

@CSSModules(styles)
class ArticleContent extends Component{
    constructor(props){
        super(props)

        this.state = {
            data: null
        }
    }

    componentWillMount(){
        $http.getFollowDetail(this.props.params.id).then((res) => {
            if(res.ok) {
                console.info(res.data)
                this.setState({
                    data: res.data
                })
            }
        })
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