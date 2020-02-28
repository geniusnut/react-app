import React from "react";
import axios from "axios";
import Button from '@material-ui/core/Button';
import {AUTH_URL} from "../../Constants";
import Logo from '../../Assets/logo.png';
import './login.css';

class AuthFormControl extends React.Component {
    state = {
        data: null
    };

    scanQrCode() {
        axios.post(AUTH_URL).then(data => {
            console.log(data);
            window.location.href = data.data.data.auth_url
        }).catch(err => {
            console.log(err);
            return null;
        });
    }

    render() {
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
                        {'扫码登录'}
                    </Button>
                </div>
            </div>
        );
    }
}

export default AuthFormControl;