import Utils from './Utils.js'

export default (nextState, replace) => {
    if(!Utils.storage.get('authentication')){
        replace({ pathname: '/login' })
    }else{
        //replace({ pathname: '/training' })
    }
}