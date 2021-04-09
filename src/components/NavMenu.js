import React, { useState, useEffect } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link, useHistory } from 'react-router-dom';
import '../css/NavMenu.css';
import logo from '../logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { fireAuth as firebaseAuth } from "../firebase"
import { useIdleTimer } from 'react-idle-timer'

function NavMenu() {

    const userLog = firebaseAuth.currentUser;
    const [collapsed, setCollapsed] = useState(true);;

    const onToggleNavbar = e => {
        setCollapsed(!collapsed);
    }

    const history = useHistory();

    const cerrarSesion = () => {

        firebaseAuth.signOut().then(() => {
            history.push('/');
            return;
          }).catch((error) => {
            console.log(error);
          });
    }

    const handleOnIdle = event => {
        getLastActiveTime();
        cerrarSesion();
    }

    const handleOnActive = event => { getRemainingTime()    }

    const handleOnAction = (e) => { }

    const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: 1000 * 60 * (900 / 60), // 15 minutos de inactividad y se sale :)
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        debounce: 500
    });


    useEffect(() => {
        if (!userLog) {
            history.push("/");
          } 
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <header className="color_special_site" >
            <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                <Container>
                    <NavbarBrand tag={Link} to="/">
                        <img src={logo} alt="logo" height={40} /> Prueba :)
                    </NavbarBrand>
                    <NavbarToggler onClick={onToggleNavbar} className="mr-2" />
                    <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!collapsed} navbar>
                        <ul className="navbar-nav flex-grow nav_to_end">
                            <NavItem>
                                <NavLink tag={Link} className="text-white" to="/product">Productos</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink tag={Link} className="text-white" to="/order">Ordenes</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink tag={Link} className="text-white" to="/client">Clientes</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink tag={Link} className="text-white" to="/user">Usuarios</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink tag={Link} className="text-white" to="/" onClick={cerrarSesion}> <FontAwesomeIcon icon={faPowerOff} /></NavLink>
                            </NavItem>
                        </ul>
                    </Collapse>
                </Container>
            </Navbar>
        </header>
    );

}

export default NavMenu;