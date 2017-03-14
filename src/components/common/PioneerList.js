import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import CSSModules from 'react-css-modules'
import { Link, hashHistory } from 'react-router'
import Utils from '../../js/Utils.js'
import UserWindow from '../common/UserWindow.js'
import $http from '../../js/HttpRequest.js'

import CommonAvatar from '../common/CommonAvatar.js'

import styles from '../../sass/pioneerList.scss'

@CSSModules(styles)
class PioneerList extends Component {
    constructor(props){
        super(props)
    }

    @autobind
    getPioneerContent(){
        const list = this.props.list
        if(list && list.length>0)
            return list.map((item, index) => {
                return <li key={item._id + index}><Link styleName="pioneer-item"><CommonAvatar userid={item._id} avatar={item.avatar}></CommonAvatar></Link></li>
            })
    }

    render() {
        return(
            <ul styleName="pioneer-list">
                {this.getPioneerContent()}
            </ul>
        )
    }
}

export default PioneerList