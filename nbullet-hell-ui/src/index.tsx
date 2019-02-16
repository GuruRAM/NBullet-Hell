import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store, history } from './store';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import 'nes.css/css/nes.css'
import 'typeface-press-start-2p'

ReactDOM.render((
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Route path="/" component={App} />
        </ConnectedRouter>
    </Provider>
), document.getElementById('root'));