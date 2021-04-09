import React, { Component } from 'react';
import { Container, Navbar, NavbarBrand } from 'reactstrap';
import { Link } from 'react-router-dom';
import '../css/NavMenu.css';
import logo from '../logo.svg';

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        return (
            <header className="color_special_site">
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">
                        <img src={logo} alt="logo" height={40} /> Prueba
                        </NavbarBrand>
                    </Container>
                </Navbar>
            </header>
        );
    }
}
