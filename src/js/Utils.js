export default {
    storage: {
        prefix: 'keep.',
        set(key, val = null) {
            if(typeof val !== 'string')
                val = JSON.stringify(val)

            localStorage.setItem(this.prefix+key, val)

            return true
        },
        get(key = null) {
            return JSON.parse(localStorage.getItem(this.prefix+key))
        },
        remove(key = null){
            if(this.has(key)) {
                localStorage.removeItem(this.prefix + key)
                return true
            }
            return false
        },
        has(key = null){
            return !!this.get(key)
        },
        clear(){
            localStorage.clear()
        }
    },
    session: {
        prefix: 'keep.',
        set(key, val = null) {
            if(typeof val !== 'string')
                val = JSON.stringify(val)

            sessionStorage.setItem(this.prefix+key, val)

            return true
        },
        get(key = null) {
            return JSON.parse(sessionStorage.getItem(this.prefix+key))
        },
        has(key = null){
            return !!this.get(key)
        }
    },
    string: {
        b64encode(str){
            return btoa(encodeURIComponent(str))
        },
        b64decode(str){
            return decodeURIComponent(atob(str))
        }
    },
    cookie: {
        set(key, val = null){
            if(!key)
                return false
            document.cookie.set()
            return true
        }
    }
}