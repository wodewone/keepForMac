import React, { Component } from 'react'
import {Link, hashHistory} from 'react-router'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import Utils from '../js/Utils.js'
import styles from '../sass/appSlideContent.scss'


@CSSModules(styles, {allowMultiple: true})
class AppSlideContent extends Component{
    constructor(props){
        super(props)

        this.state = {
            className: 'slide-content',
        }
    }

    @autobind
    componentDidMount(){
        setTimeout(() => {
            this.timer = this.setState({
                className: 'slide-content active'
            })
        },100)
    }

    @autobind
    componentWillUnmount(){
        this.timer && clearTimeout(this.timer)
    }

    @autobind
    handleGoback(){
        this.setState({
            className: 'slide-content'
        })
        setTimeout(() => {
            hashHistory.goBack()
        }, 350)
    }

    render(){
        return (
            <div styleName="slide-wrap">
                <div styleName="slide-mask"></div>
                <div styleName={this.state.className}>
                    <button styleName="button-slide-goback" onClick={this.handleGoback}><i className={`iconfont icon-goback fz36`}></i></button>
                    <div>
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}

export default AppSlideContent