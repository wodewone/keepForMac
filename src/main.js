const { ipcRenderer } = require('electron');
import './sass/app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
//import { AppContainer } from 'react-hot-loader'
import { Router, IndexRoute, Route, hashHistory, Link } from 'react-router'
import App from './js/App'
import AppLogin from './js/AppLogin'
import AppTraining from './components/AppTraining/AppTraining'
import AppExplore from './components/AppExplore/AppExplore'

import AppRecord from './components/AppRecord/AppRecord'
import ArticleContent from './components/AppRecord/ArticleContent.js'
import HashtagContent from './components/AppRecord/HashtagContent.js'

import AppUserCenter from './components/AppUserCenter/AppUserCenter'

import AppWorkout from './components/AppTraining/workouts/AppWorkout.js'
import WorkoutDescription from './components/AppTraining/workouts/WorkoutDescription.js'

import RequireAuth from './js/RequireAuth'

// 全局搜索处理
ipcRenderer.on('global-search', () => {
});

const app = document.createElement('div');
app.id = 'app';
app.className= "container";
document.querySelector('body').appendChild(app);

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path='/' onEnter={RequireAuth} component={App}>
            <IndexRoute component={AppTraining}></IndexRoute>
            <Route path='training' component={AppTraining}></Route>
                <Route path='/plan/:plan_id' component={AppWorkout}>
                    <Route path=':desc_id' component={WorkoutDescription}></Route>
                </Route>

            <Route path='explore' component={AppExplore}></Route>
            <Route path='record' component={AppRecord}>
                <Route path='/hashtag/:tag_name' component={HashtagContent}></Route>
                <Route path='/article/:id' component={ArticleContent}></Route>
            </Route>
            <Route path='user-center' component={AppUserCenter}></Route>
        </Route>
        <Route path='/login' component={AppLogin}></Route>

        <Route path='*' component={AppLogin}></Route>
    </Router>,
    document.getElementById('app')
)

// Hot Module Replacement API
//if (module.hot) {
//    module.hot.accept('./components/App', () => {
//        const NextApp = require('./components/App').default;
//        ReactDOM.render(
//            <AppContainer>
//                <App />
//            </AppContainer>,
//            document.getElementById('app')
//        );
//    });
//}