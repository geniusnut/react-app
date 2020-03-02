import React from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    IconButton
} from '@material-ui/core';
import IMController from '../../Controllers/IMController';
import AuthStore from '../../Stores/AuthorizationStore'
import './Header.css';
import MainMenuButton from "../ColumnLeft/MainMenuButton";

class DialogsHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    handleLogOut = () => {
        this.setState({ open: true });
        IMController.logout()
    };

    render() {
        const { onClick} = this.props;

        const title = AuthStore.current ? AuthStore.current.nick : "IMNut";
        return (
            <div className='header-master'>
                <>
                    <MainMenuButton onLogOut={this.handleLogOut} />
                </>

                <div className='header-status grow cursor-pointer' onClick={onClick}>
                    <span className='header-status-content'>{title}</span>
                </div>
            </div>
        );
    }
}

export default DialogsHeader;