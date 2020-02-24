import React from 'react';
import './App.css';
import MainPage from './Components/MainPage';
import IMController from "./Controllers/IMController";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inactive: false,
        }
    }

    componentWillMount() {
        IMController.init();
    }

    componentDidMount() {
        IMController.addListener('update', this.onUpdate)
    }

    componentWillUnmount() {
        IMController.off('update', this.onUpdate)
    }

    onUpdate = update => {
        console.log('update: ' +update['@type'])
    };

    render() {
        const {inactive} = this.state;
        let page = <MainPage />;
        return (
            <div id='app'>
                {page}
            </div>
        );
    };
}

export default App;
