import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'

import $http from '../js/HttpRequest.js'
import CommonAvatar from './common/CommonAvatar.js'

import styles from '../sass/appSearch.scss'

@CSSModules(styles)
class AppSearch extends Component{
    constructor(props){
        super(props)

        this.state = {
            indexTag: null,
            focus: null,
            content: null
        }
    }

    @autobind
    getResultContent(){
        let getItemType = (type, single) => {
            if(type == 'group')
                return false

            switch(type){
                case 'username':
                    return (
                        <span styleName="item-avatar"><CommonAvatar userid={single.id} avatar={single.pic}></CommonAvatar></span>
                    )
                case 'material':
                case 'goods':
                    return (
                        <img styleName="item-pic" src={single.pic ? `${single.pic}?imageMogr2/thumbnail/!100` : ''} alt=""/>
                    )
            }
        }

        if(this.state.content) {
            return this.state.indexTag.map((item, index) => {
                if(this.state.content[item.searchType].entites.length)
                return (
                    <li key={index} onClick={this.handleClick}>
                        <header styleName="list-header">{item.name}</header>
                        {this.state.content[item.searchType].entites.map((single, sinIndex) => {
                            return (
                                <div key={sinIndex} styleName="list-item">
                                    {getItemType(item.searchType, single)} {single.title || single.desc}
                                </div>
                            )
                        })}
                    </li>
                )
            })
        }
    }

    @autobind
    handleClick(e){
        this.setState({
            content: null
        })
    }

    @autobind
    handleSearch(e){
        if(e.target.value)
            $http.getGlobalSearch(encodeURIComponent(e.target.value)).then((res) => {
                if(res.ok){
                    console.info(res)
                    this.setState({
                        indexTag: res.data.index,
                        content: res.data.result
                    })
                }
            })
        else
            this.setState({
                content: null
            })
    }

    render(){
        return(
            <div styleName="common-search-wrap">
                <i styleName="icon-search" className={`iconfont icon-search fz18`}></i>
                <input styleName="common-search" onChange={this.handleSearch} type="search" onFocus={this.state.focus} placeholder="搜索"/>
                <section styleName="search-result" hidden={!this.state.content}>
                    <ul styleName="result-list">
                        {this.getResultContent()}
                    </ul>
                </section>
            </div>
        )
    }
}

export default AppSearch