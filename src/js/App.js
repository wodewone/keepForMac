import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import { Link, hashHistory } from 'react-router'
import styles from '../sass/index.scss'
import AppSearch from '../components/AppSearch.js'
import UserWindow from '../components/common/UserWindow.js'
import Utils from '../js/Utils.js'
import $http from './HttpRequest.js'

@CSSModules(styles)
class App extends Component{
    constructor(props){
        super(props);

        this.state = {
            user: {},
            disabledBack: true,
            disabledForward: true
        }
    }

    @autobind
    componentDidMount(){
        const userData = Utils.storage.get('userData')
        if(userData._id){
            this.setState({
                user : userData
            })
        }

    }

    @autobind
    getUser(){
        if(this.state.user._id)
            return(
                <div styleName="header-user" onClick={() => {Utils.storage.set('userInfo', Utils.storage.get('mineInfo'));UserWindow.create('我的资料')}}>
                    <img styleName="header-avatar" src={this.state.user.avatar} alt=""/>
                </div>
            )
    }

    @autobind
    componentWillMount(){
        console.warn(this.props.router.routes)
        const userData = Utils.storage.get('userData') || {}

        if(Utils.storage.get('userData')._id) {
            // 获取登录用户信息缓存
            $http.getUserData(Utils.storage.get('userData')._id).then((response) => {
                if (response.ok) {
                    Utils.storage.set('mineInfo', response.data)
                }
            })
        }

        if(!Utils.storage.has('cityData')) {
            // 获取地区信息缓存
            $http.getCityJson().then((response) => {
                if (response.ok) {
                    Utils.storage.set('cityData', response.data)
                    let cityArr = []
                    response.data.forEach((city) => {
                        cityArr = [...cityArr, ...city.children.map((item) => {
                            return {
                                'cityCode': item.code,
                                'cityName': city.name + ',' +item.name
                            }
                        })]
                    })
                    Utils.storage.set('cityJson', cityArr)
                }
            })
        }
    }

    @autobind
    historyActionBack(){
        hashHistory.goBack()
        if(1)
            this.setState({disabledBack: true})
        else
            this.setState({disabledForward: false})
    }

    @autobind
    historyActionForward(){
        //if(hashHistory.component[hashHistory.component-1].displayName) {
        if(hashHistory) {
            this.setState({
                disabledBack: false
            })
            hashHistory.goForward()
        }else{
            this.setState({
                disabledForward: true
            })
        }
    }

    @autobind
    handleBuild(){
        alert('此模块功能暂未完成，敬请期待！')
    }

    render(){
        return (
            <div style={{width:'100%'}}>
                <header styleName="index-header">
                    <div styleName="index-logo">
                        <img src="http://staticssl.gotokeep.com/show/images/homepage/logo-ec5cad8f05.png" alt=""/>
                    </div>
                    <div styleName="history-col">
                        <button disabled={0} styleName="history-button" onClick={this.historyActionBack}><i className={`iconfont icon-forward`}></i></button>
                        <button disabled={0} styleName="history-button" onClick={this.historyActionForward}><i className={`iconfont icon-goback`}></i></button>
                    </div>
                    <div styleName="col">
                        <AppSearch></AppSearch>
                    </div>
                    <div styleName="col">
                        {this.getUser()}
                    </div>
                </header>
                <main styleName="main-container">
                    <nav styleName="index-left-menu">
                        <div styleName="index-menu-bg"></div>
                        <li><Link to="/training" activeClassName="active"><i className={'iconfont icon-training fz18'}></i>训练</Link></li>
                        <li><Link to="/explore" activeClassName="active"><i className={'iconfont icon-discovery fz18'}></i>发现</Link></li>
                        {/* <li><Link to="/record" activeClassName="active"><i className={'iconfont icon-record fz18'}></i>动态</Link></li> */}
                        {/* <li><Link to="/user-center" activeClassName="active"><i className={'iconfont icon-usercenter fz18'}></i>我</Link></li> */}
                        <li onClick={this.handleBuild}><Link activeClassName="active"><i className={'iconfont icon-record fz18'}></i>动态</Link></li>
                        <li onClick={this.handleBuild}><Link activeClassName="active"><i className={'iconfont icon-usercenter fz18'}></i>我</Link></li>
                    </nav>
                    <div styleName="index-content">
                        {this.props.children}
                    </div>
                </main>
            </div>
        );
    }
}

export default App