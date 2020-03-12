/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import UserTile from './UserTile';
import './UserControl.css';
import {getUser} from "../../Utils/User";

class UserControl extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.userId !== this.props.userId;
    }

    handleClick = () => {
        const { userId, onSelect } = this.props;
        if (!onSelect) return;

        onSelect(userId);
    };

    render() {
        const { userId } = this.props;
        const user = getUser(userId);

        const title =  user && user.nick ? user.nick : "UserName";
        return (
            <div className='user' onClick={this.handleClick}>
                <div className='user-wrapper'>
                    <UserTile userId={userId} />
                    <div className='dialog-inner-wrapper'>
                        <div className='tile-first-row'>
                            <div className='dialog-title'>{title}</div>
                        </div>
                        <div className='tile-second-row'>
                            {/*<UserStatusControl userId={userId} />*/}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

UserControl.propTypes = {
    userId: PropTypes.number.isRequired,
    onSelect: PropTypes.func
};

export default UserControl;
