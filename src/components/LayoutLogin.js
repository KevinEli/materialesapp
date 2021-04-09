import React, { Component } from 'react';
import { NavMenu } from './NavLogin';
import '../css/Login.css'

export class LayoutLogin extends Component {
    static displayName = LayoutLogin.name;

    render() {
        return (
            <div>
                <NavMenu />
               {this.props.children}
            </div>
        );
    }
}
