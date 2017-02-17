import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import { Link } from 'react-router'
import styles from '../sass/index.scss'

@CSSModules(styles)
class AppMenu extends Component{
    constructor(props){
        super(props);
    }

    @autobind
    handleClick(){
        alert('此模块功能暂未完成，敬请期待！')
    }

    render(){
        return (
            <nav styleName="index-left-menu">
                <li><Link to="/training" activeClassName="active"><i className={'iconfont icon-training fz22'}></i>训练</Link></li>
                <li><Link to="/explore" activeClassName="active"><i className={'iconfont icon-discovery fz22'}></i>发现</Link></li>
                {/*<li><Link to="/record" activeClassName="active"><i className={'iconfont icon-record fz22'}></i>动态</Link></li>*/}
                {/*<li><Link to="/user-center" activeClassName="active"><i className={'iconfont icon-usercenter fz22'}></i>我</Link></li>*/}
                <li onClick="handleClick()"><Link activeClassName="active"><i className={'iconfont icon-record fz22'}></i>动态</Link></li>
                <li onClick="handleClick()"><Link activeClassName="active"><i className={'iconfont icon-usercenter fz22'}></i>我</Link></li>
            </nav>
        );
    }
}

export default AppMenu