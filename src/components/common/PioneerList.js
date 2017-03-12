import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import CSSModules from 'react-css-modules'
import { Link, hashHistory } from 'react-router'

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
                return <li key={item._id + index}><Link styleName="pioneer-item" onClick={() => this.handleUserInfo(item._id)} ><img src={item.avatar || require('../../assets/images/default-avatar.png')} alt=""/></Link></li>
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