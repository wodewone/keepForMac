import React,{Component} from 'react'
import CSSModules from 'react-css-modules'
import Utils from './Utils.js'
import styles from '../sass/appLogin.scss'
import autobind from 'autobind-decorator'
import {Base64} from 'js-base64'
import $http from './HttpRequest.js'

@CSSModules(styles)
class AppLogin extends Component{
    constructor(props){
        super(props)

        this.state = {
            mobile: '',
            password: ''
        }
    }

    @autobind
    componentWillMount(){
        const user = Utils.storage.get('authentication')
        if(user && user.token){
            this.props.router.replace('/training')
        }
    }

    @autobind
    handleChange(e){
        this.setState({[e.target.name]: e.target.value})
    }

    @autobind
    handleSubmit(e){
        e.preventDefault()

        if(this.state.mobile.length < 11){
            alert('请输入正确的手机号码')
            return false;
        }
        if(!this.state.password){
            alert('请输入正确的登录密码')
            return false;
        }

        $http.login({
            mobile: this.state.mobile,
            password: this.state.password
        }).then((response) =>{
            if(response.ok){
                Utils.storage.set('authentication', response.data)
                Utils.storage.set('userData', Base64.decode(response.data.token.split('.')[1]))
                this.props.router.replace('/training')
            }else{
                alert(response.text || '登录失败')
            }
        }, (error) => {
            console.info(error)
        })
    }

    render(){
        return(
            <div styleName="app-container">
                <video styleName="bg-video" src="http://static1.gotokeep.com/homepage/5s.mp4" muted autoPlay loop></video>
                <form id="loginForm" styleName="app-login" onSubmit={this.handleSubmit}>
                    <h2 styleName="login-title">登录你的 Keep</h2>
                    <div styleName="form-control">
                        <input name="mobile" value={this.state.mobile} onChange={this.handleChange} styleName="form-input" type="text" maxLength="11" autoFocus placeholder="你的手机号"/>
                    </div>
                    <div styleName="form-control">
                        <input name="password" value={this.state.password} onChange={this.handleChange} styleName="form-input" type="password" placeholder="登录密码"/>
                    </div>
                    <div styleName="form-control">
                        <button styleName="login-btn" type="submit">登录</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default AppLogin