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
import './Header.css';

class DialogsHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    handleLogOut = () => {
        this.setState({ open: true });
    };

    render() {
        return (
            <div className='header-master'>
                <div className='header-status grow cursor-pointer'>
                    <span className='header-status-content'>{('IMNut')}</span>
                </div>
            </div>
        );
    }
}

export default DialogsHeader;