import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import AppRoute from './AppRoute';
import { Layout } from '../components/Layout';
import { LayoutLogin } from '../components/LayoutLogin';

import Login from '../pages/login/Login';
import Order from '../pages/order/Order';
import OrderEdit from '../pages/order/Edit';
import Product from '../pages/product/Product';
import User from '../pages/user/User';
import Client from '../pages/client/Client';

function App() {
    return (
        <div>
            <BrowserRouter>
                <Switch>

                    <AppRoute exact path='/' component={Login} layout={LayoutLogin} />
                    <AppRoute exact path='/login' component={Login} layout={LayoutLogin} />

                    <AppRoute path="/product" component={Product} layout={Layout} />
                    
                    <AppRoute path='/order' component={Order} layout={Layout} />
                    <AppRoute path='/orderEdit/:id' component={OrderEdit} layout={Layout} />
                    
                    <AppRoute path='/user' component={User} layout={Layout} />
                    <AppRoute path='/client' component={Client} layout={Layout} />
                    
              </Switch>
            </BrowserRouter>            
        </div>
    );
}

export default App;