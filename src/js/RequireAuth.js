import {hashHistory} from "react-router"
import Utils from "./Utils.js"

export default (nextState, replace) => {
    if (hashHistory.getCurrentLocation().pathname !== "/login" && !Utils.storage.get("authentication")) {
        replace({pathname: "/login"})
    }
}