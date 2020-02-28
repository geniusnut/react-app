import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import * as serviceWorker from './serviceWorker';
import LoginRedirect from "./Components/Auth/LoginRedirect";


ReactDOM.render(
    <Router basename={process.env.PUBLIC_URL}>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route path="/login/redirect/" component={LoginRedirect} />
        </Switch>
    </Router>,
    document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
