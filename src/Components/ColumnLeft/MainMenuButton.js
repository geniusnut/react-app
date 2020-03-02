/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import withStyles from '@material-ui/core/styles/withStyles';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { isAuthorizationReady } from '../../Utils/Common';
import AuthStore from '../../Stores/AuthorizationStore';

const styles = {
    menuIconButton: {
        margin: '8px -2px 8px 12px'
    },
    searchIconButton: {
        margin: '8px 12px 8px 0'
    }
};

const menuAnchorOrigin = {
    vertical: 'bottom',
    horizontal: 'left'
};

class MainMenuButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authorizationState: AuthStore.current,
            anchorEl: null
        };
    }

    componentDidMount() {
        AuthStore.on('updateAuthorizationState', this.onUpdateAuthorizationState);
    }

    componentWillUnmount() {
        AuthStore.off('updateAuthorizationState', this.onUpdateAuthorizationState);
    }

    onUpdateAuthorizationState = update => {
        this.setState({ authorizationState: update.auth_state });
    };

    handleMenuOpen = event => {
        const { auth_state } = AuthStore.current;
        if (!isAuthorizationReady(auth_state)) return;
        console.log("setState ", event.currentTarget)
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuClose = () => {
        this.setState({ anchorEl: null });
    };

    handleLogOut = () => {
        this.handleMenuClose();

        this.props.onLogOut();
    };

    setRef = ref => {
        console.log(this);
    };

    render() {
        const { classes, t } = this.props;
        const { anchorEl,  } = this.state;
        const {auth_state} = AuthStore.current;

        const mainMenuControl = isAuthorizationReady(auth_state) ? (
            <>
                <Menu
                    id='main-menu'
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleMenuClose}
                    getContentAnchorEl={null}
                    disableAutoFocusItem
                    disableRestoreFocus={true}
                    anchorOrigin={menuAnchorOrigin}>
                    <MenuItem onClick={this.handleLogOut}>{t('LogOut')}</MenuItem>
                </Menu>
            </>
        ) : null;

        return (
            <>
                <IconButton
                    aria-owns={anchorEl ? 'simple-menu' : null}
                    aria-haspopup='true'
                    className={classes.menuIconButton}
                    aria-label='Menu'
                    onClick={this.handleMenuOpen}>
                    <MenuIcon />
                </IconButton>
                {mainMenuControl}
            </>
        );
    }
}

const enhance = compose(
    withTranslation(),
    withStyles(styles, { withTheme: true })
);

export default enhance(MainMenuButton);
