import Utils from './Utils.js'
import moment from 'moment'
import autobind from 'autobind-decorator'

const hostname = 'https://api.gotokeep.com'

const serializeJSON = (data) => {
    return Object.keys(data).map((keyName) => {
        return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName])
    }).join('&');
}

export default class Http {
    constructor(){
    }

    static getToken() {
        const authentication = Utils.storage.get('authentication') || {}
        return 'Bearer '+ authentication.token
    }

    static httpGet(url, options){
        if(!url){
            return false
        }

        if(!options){
            options = {
                method: 'GET',
                headers: {
                    'Authorization': this.getToken()
                }
            }
        }

        return fetch(hostname + url, options).then((res) => res.json())
    }

    static httpPost(url, options){
        if(!url){
            return false
        }
        if(!options){
            options = {
                method: 'GET',
                headers: {
                    'Authorization': this.getToken()
                }
            }
        }
        console.info(url)

        return fetch(hostname + url, options).then((res) => res.json())
    }

    /**
     * Dashboard
     */
    // Plans
    static getDashboardTraining() {
        return this.httpGet('/training/v2/home')
    }

    static getDashboardWorkouts() {
        return this.httpGet('/v2/home/dashboard/pwData')
    }

    // Statistics
    static getDashboardStatistics() {
        return this.httpGet('/v1.1/home/dashboard/statistics')
    }
    // User
    static getDashboardUser() {
        return this.httpGet('/v1.1/home/dashboard/user')
    }
    static getRankingData() {
        const para = serializeJSON({
            date: moment().format('YYYYMMDD')
        })
        return this.httpGet('/social/v2/rankinglist/brief?'+para)
    }

    // user login
    static login(data) {
        return this.httpPost('/v1.1/users/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            body: serializeJSON(data)
        })
    }

    // 用户个人信息
    static getUserData(userID) {
        return this.httpGet('/v2/people/'+ userID)
    }


    // workouts content
    //getExploreContent() {
    //    return fetch('https://show.gotokeep.com/explore/', {
    //        method: 'GET',
    //        headers: {
    //            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    //            'Authorization': this.getToken()
    //        }
    //    })
    //}

    // workout plan
    static getPlansContent(workoutsId, gender = 'm'){
        return this.httpGet('/v2/plans/'+ workoutsId +'?trainer_gender='+ gender)
    }
    static getWorkoutsContent(workoutsId){
        return this.httpGet('/v1.1/workouts/'+ workoutsId +'/dynamic?tLimit=3')
    }
}

