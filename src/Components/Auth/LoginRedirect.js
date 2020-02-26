import * as React from "react";
import * as qs from 'query-string';
import axios from 'axios';

import IMController from "../../Controllers/IMController";
import {AuthStateEnum} from "../../Stores/AuthorizationStore";
import {AUTH_INFO_URL_TEST} from "../../Constants";

class LoginRedirect extends React.Component {
    componentDidMount() {

        const parsed = qs.parse(window.location.search);
        console.log(parsed);
        axios.post(AUTH_INFO_URL_TEST, "auth_id=" + parsed.auth_id).then(data => {
            const authState = data.data.code === 200 ? AuthStateEnum.STATE_LOGIN: AuthStateEnum.STATE_FAILED;
            const authData = {auth_state: authState, ...data.data.data}
            IMController.update({
                '@type': "updateAuthState",
                data: authData,
            })
            // window.location.href = '/';
        }).catch(err => {
            console.log(err)
            const authData = {auth_state: AuthStateEnum.STATE_FAILED}
            IMController.update({
                '@type': "updateAuthState",
                data: authData,
            })
        })
    }

    render() {
        return(
            <div>
                <span>Redirecting...</span>
            </div>
        )
    }
}

export default LoginRedirect;