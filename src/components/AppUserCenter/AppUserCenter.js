import React, { Component } from 'react'

class AppUserCenter extends Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            <div style={{width:'100%'}}>
                <AppMenu></AppMenu>
                <div className="index-content">
                    <div>AppUserCenter</div>
                </div>
            </div>
        )
    }
}

export default AppUserCenter