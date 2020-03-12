import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {withTranslation} from "react-i18next";
import {compose} from "recompose";


class MainMenuButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null,
        };
    }

    handleButtonClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleChatInfo = () => {
        this.handleMenuClose();
        setTimeout(() => this.props.openChatDetails(), 150);
    };

    handleMenuClose = () => {
        this.setState({ anchorEl: null });
    };
    handleLogOut = () => {
        this.handleMenuClose();

        this.props.onLogOut();
    };

    render() {
        const { anchorEl } = this.state;
        return (
            <>
                <IconButton
                    aria-owns={anchorEl ? 'simple-menu' : null}
                    aria-haspopup='true'
                    className='main-menu-button'
                    aria-label='Menu'
                    onClick={this.handleButtonClick}>
                    <MoreVertIcon />
                </IconButton>

                <Menu
                    id='main-menu'
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleMenuClose}
                    getContentAnchorEl={null}
                    disableAutoFocusItem
                    disableRestoreFocus={true}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}>
                    <MenuItem onClick={this.handleChatInfo}>{'ChatInfo'}</MenuItem>
                </Menu>
            </>
        );
    }
}

const enhance = compose(
    withTranslation()
);

export default enhance(MainMenuButton);

