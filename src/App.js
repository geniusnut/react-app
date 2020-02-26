import React from 'react';
import './App.css';
import MainPage from './Components/MainPage';
import IMController from "./Controllers/IMController";
import AppStore from './Stores/ApplicationStore';
import AuthorizationStore, {AuthStateEnum} from './Stores/AuthorizationStore';
import AuthFormControl from "./Components/Auth/AuthFormControl";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inactive: false,
            prevAuthorizationState: AuthorizationStore.current,
            authorizationState: null,
        }
    }

    componentWillMount() {
    }

    componentDidMount() {
        IMController.addListener('update', this.onUpdate)

        AppStore.on('clientUpdateAuthState', this.onUpdateAuthorizationState);
    }

    componentWillUnmount() {
        IMController.off('update', this.onUpdate)

        AppStore.off('clientUpdateAuthState', this.onUpdateAuthorizationState);
    }

    onUpdateAuthorizationState = update => {
        // const { state: authorizationState } = update;
        //
        // this.setState({ authorizationState });
        //
        // if (!window.hasFocus) return;
        // if (!authorizationState) return;

        console.log("onUpdateAuthorizationState")
        IMController.init(AppStore.getCid())
    };

    onUpdate = update => {
        console.log('update: ' +update['@type'])
    };

    render() {
        const {inactive} = this.state;
        let { authorizationState, prevAuthorizationState } = this.state;
        if (!authorizationState) {
            if (prevAuthorizationState) {
                authorizationState = prevAuthorizationState;
            } else {
                authorizationState = {
                    auth_state: AuthStateEnum.STATE_IDLE,
                };
            }
        }
        let page = <MainPage />;
        if (authorizationState) {
            switch (authorizationState.auth_state) {
                case AuthStateEnum.STATE_IDLE: {
                    page = (
                        <AuthFormControl
                            authorizationState={authorizationState}
                        />
                    );
                    break
                }
                case AuthStateEnum.STATE_LOGIN: {
                    IMController.clientUpdate({
                        '@type': 'clientUpdateAuthState',
                        ...authorizationState
                    });
                    IMController.init(authorizationState.uid);
                    break;
                }
                default:
                    break;
            }
        }
        return (
            <div id='app'>
                {page}
            </div>
        );
    };
}

export default App;
