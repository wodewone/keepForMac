import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from '../sass/appSearch.scss'

@CSSModules(styles)
class AppSearch extends Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            <div styleName="common-search-wrap">
                <i styleName="icon-search" className={`iconfont icon-search fz18`}></i>
                <input styleName="common-search" type="search" placeholder="搜索"/>
            </div>
        )
    }
}

export default AppSearch