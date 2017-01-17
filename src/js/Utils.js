export default {
    storage: {
        prefix: 'keep.',
        set: function(key, val = null) {
            if(typeof val !== 'string')
                val = JSON.stringify(val)

            localStorage.setItem(this.prefix+key, val)

            return true
        },
        get: function(key = null) {
            return JSON.parse(localStorage.getItem(this.prefix+key))
        },
        has: (key = null) => {
            return !!this.get(key)
        }
    },
    string: {
        b64encode: (str) => {
            return btoa(encodeURIComponent(str))
        },
        b64decode: (str) => {
            return decodeURIComponent(atob(str))
        }
    },
    cookie: {
        set: (key, val = null) => {
            if(!key)
                return false
            document.cookie.set()
            return true
        }
    }
}