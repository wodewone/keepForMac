import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from '../../sass/appTraining.scss'

@CSSModules(styles)
class AppScroll extends Component{
    constructor(props){
        super(props)
    }


    getItem(type){
        let data = []
        if(type === 'article'){
            this.props.data.data.forEach(function (item) {
                data.push(
                    <li key={item.id}>
                        <div styleName="scroll-cover" style={{backgroundImage: `url(${item.picture})`}}></div>
                        <div className="text-center padding">
                            <p styleName="scroll-hot-title">{item.title}</p>
                            <p styleName="scroll-hot-desc">{item.description}</p>
                        </div>
                    </li>
                )
            })
        }else {
            this.props.data.data.forEach(function (item) {
                data.push(
                    <li key={item.id} className="padding" style={{backgroundImage: `url(${item.picture})`}}>
                        <p styleName="training-block-title">{item.title}</p>

                        <p styleName="training-block-desc">{item.pioneer}已参加</p>
                    <span className="text-left" styleName="training-block-info">
                        <span className="fz18 font-bold">K{item.rating}</span><span styleName="block-info-time">{item.itemValue}分钟</span>
                    </span>
                    </li>
                )
            })
        }

        return data
    }

    render(){
        if(!this.props.data || !this.props.data.data){
            return false
        }

        return(
            <section className="white-background margin-bottom" styleName="scroll-wrap">
                <p styleName="scroll-title">{this.props.data.sectionName}</p>
                <ul styleName="scroll-list">
                    {this.getItem(this.props.data.type)}
                </ul>
            </section>
        )
    }
}

export default AppScroll