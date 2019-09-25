import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'semantic-ui/dist/semantic.min.css';
import * as firebase from 'firebase';
import FirebaseData from './FirebaseData.js';

import Login from './Login.js';
import Register from './Register.js';
import { Router } from '@reach/router'

function App() {
    return (
        <div className="App">
            <Router>
                <Login path='/' />
                <Register path='/signup' />
            </Router>
        </div>
    );
}   
  // Initialize Firebase
  firebase.initializeApp(FirebaseData.firebaseConfig);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
