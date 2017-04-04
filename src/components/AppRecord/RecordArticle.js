import React, { Component } from 'react'
import $http from '../../js/HttpRequest.js'
import autobind from 'autobind-decorator'
import CSSModules from 'react-css-modules'
import { Link, hashHistory } from 'react-router'
import moment from 'moment'
import Utils from '../../js/Utils.js'

import styles from '../../sass/appRecord.scss'

@CSSModules(styles)
class CommonArticle extends Component {
    constructor(props){
        super(props)
    }

    render() {
        let item = this.props.data

        let handleText = (val) => {
            const reg = /(<br>)/g
            let br = React.createElement('br')
            return val.replace(/\n/g, '<br>').split(reg).map((item, index) => {
                return item.match(reg) ? <br key={index} /> : item
            })
        }

        let handleLink = (val) => {
            const reg = /(#(?!\s*#)[^#]+#)/g
            return val.split(reg).map((ment, key) => {
                return !ment.match(reg) ? handleText(ment) : <Link key={key} to={`/hashtag/${encodeURIComponent(ment.substring(1, ment.length-1))}`}>{ment}</Link>
            })
        }


        switch (item.type){
            case 'article':
                return (
                    <Link to={`/article/${item._id}`} styleName="article-card">
                        <img src={item.photo ? `${item.photo}?imageMogr2/thumbnail/!600` : ''} alt=""/>
                        <article styleName="art-blur-inner">
                            <div styleName="inner-back" style={{backgroundImage: `url(${item.photo})`}}></div>
                            <p styleName="card-title">{handleText(item.title)}</p>
                            <p styleName="card-desc">{handleText(item.content)}</p>
                        </article>
                    </Link>
                )
                break;
            case 'normal':
            case 'direct':
                return (
                    <div styleName="art-content">
                        <Link to={`/article/${item._id}`}><img styleName="art-photo" src={item.photo ? `${item.photo}?imageMogr2/thumbnail/!300` : ''} alt=""/></Link>
                        <div styleName="art-con-inner">
                            <p styleName="art-txt">{handleLink(item.content)}</p>
                            <p styleName="article-line"><Link styleName="article-more" to={`/article/${item._id}`}>查看全部</Link></p>
                        </div>
                    </div>
                )
                break;
            case 'share':
                return(
                    <div>
                        <div styleName="art-con-inner">
                            <p styleName="art-txt">{handleLink(item.content)}</p>
                            <p styleName="article-line"><Link styleName="article-more" to={`/article/${item._id}`}>查看全部</Link></p>
                        </div>
                        <Link to={item.shareCard.url} styleName="art-share-card">
                            <div styleName="card-img" style={{backgroundImage:`url(${item.shareCard.image})`}}></div>
                            <div styleName="card-inner">
                                <p styleName="card-title">{handleText(item.shareCard.title)}</p>
                                <p styleName="card-desc">{handleText(item.shareCard.content)}</p>
                            </div>
                        </Link>
                    </div>
                )
                break;
            case 'run':
                return(
                    <div>
                        <div styleName="art-content">
                            <Link to={`/article/${item._id}`}><img hidden={!item.photo} styleName="art-photo" src={item.photo ? `${item.photo}?imageMogr2/thumbnail/!300` : ''} alt=""/></Link>
                            <div styleName="art-con-inner">
                                <p styleName="art-txt">{handleLink(item.content)}</p>
                                <p styleName="article-line"><Link styleName="article-more" to={`/article/${item._id}`}>查看全部</Link></p>
                            </div>
                        </div>
                        <div styleName="art-run-card">
                            <p styleName="art-run-title"><img width="18" src={item.meta.icon} alt=""/> <span dangerouslySetInnerHTML={{__html: item.meta.title}}></span></p>
                            <img src={item.meta.picture ? `${item.meta.picture}?imageMogr2/thumbnail/!360` : ''} alt=""/>
                        </div>
                    </div>
                )
                break;
        }
    }
}

export default CommonArticle