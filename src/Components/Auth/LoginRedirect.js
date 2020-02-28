import * as React from "react";
import * as qs from 'query-string';
import axios from 'axios';

import IMController from "../../Controllers/IMController";
import {AuthStateEnum} from "../../Stores/AuthorizationStore";
import {AUTH_INFO_URL} from "../../Constants";

class LoginRedirect extends React.Component {
    componentDidMount() {

        const parsed = qs.parse(window.location.search);
        console.log("redirect to: ", `${process.env.PUBLIC_URL}`)
        axios.post(AUTH_INFO_URL, "auth_id=" + parsed.auth_id).then(data => {
            const authState = data.data.code === 200 ? AuthStateEnum.STATE_LOGIN: AuthStateEnum.STATE_FAILED;
            const authData = {auth_state: authState, ...data.data.data}
            IMController.update({
                '@type': "updateAuthState",
                data: authData,
            })

            window.location.href = process.env.PUBLIC_URL + "/";
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