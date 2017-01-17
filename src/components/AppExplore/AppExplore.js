import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import AppMenu from '../AppMenu.js'
import styles from '../../sass/appExplore.scss'

import http from '../../js/HttpRequest.js'

@CSSModules(styles)
class AppExplore extends Component{
    constructor(props){
        super(props)
        this.state = {
            exploreContent: ''
        }
    }

    //@autobind
    //componentWillMount(){
    //    http.getExploreContent().then((res) => {
    //        if(res.status == 200)
    //            return res.text()
    //        else
    //            return false
    //    }).then((res) => {
    //        if(res)
    //            this.setState({exploreContent: res})
    //    }).catch((error) => {
    //        console.info(error)
    //    })
    //}

    @autobind
    getExploreHtml(){
        return <iframe styleName="explore-frame" src="http://show.gotokeep.com/explore/" />
    }

    render(){
        return(
            <div style={{height:"100%"}}>
                {this.getExploreHtml()}
            </div>
        )
    }
}

export default AppExplore