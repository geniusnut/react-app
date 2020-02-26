import React from "react";
import axios from "axios";
import Button from '@material-ui/core/Button';
import {AUTH_URL_TEST} from "../../Constants";
import Logo from '../../Assets/logo.png';
import './login.css';

class AuthFormControl extends React.Component {
    state = {
        data: null
    };

    scanQrCode() {
        axios.post(AUTH_URL_TEST).then(data => {
            console.log(data);
            window.location.href = data.data.data.auth_url
        }).catch(err => {
            console.log(err);
            return null;
        });
    }

    render() {
        const {authorizationState: state} = this.props;
        const {data} = this.state;

        return (
            <div className='authorization-form'>
                <div className='authorization-form-content'>
                    <div className='auth-caption'>
                        <div className='auth-caption-logo'>
                            <img src={Logo} />
                        </div>
                    </div>
                    <Button
                        classes={{ root: 'auth-button' }}
                        variant='contained'
                        disableElevation
                        fullWidth
                        color='primary'
                        onClick={this.scanQrCode}>
                        {'ScanQRCode'}
                    </Button>
                </div>
            </div>
        );
    }
}

export default AuthFormControl;