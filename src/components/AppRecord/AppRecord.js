import React, { Component } from 'react'

class AppRecord extends Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            <div style={{width:'100%'}}>
                <AppMenu></AppMenu>
                <div styleName="index-content">
                    <div>AppRecord</div>
                </div>
            </div>
        )
    }
}

export default AppRecord