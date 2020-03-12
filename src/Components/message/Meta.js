/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Status from './Status';
import MessageStore from '../../Stores/MessageStore';
import './Meta.css';
import {getDate} from "../../Utils/Message";
import AppStore from "../../Stores/ApplicationStore";

class Meta extends React.Component {
    render() {
        const { className, chatId, messageId, date, editDate, onDateClick, t, views, style } = this.props;

        const message = MessageStore.get(chatId, messageId);
        if (!message) return null;

        const sender_user_id = message.msg.getCid();
        const is_outgoing = sender_user_id === AppStore.getCid();

        const dateStr = getDate(date);

        return (
            <div className={classNames('meta', className)} style={style}>
                <span>&ensp;</span>
                {views > 0 && (
                    <>
                        <VisibilityIcon className='meta-views-icon' />
                        <span className='meta-views'>
                            &nbsp;
                            {views}
                            &nbsp; &nbsp;
                        </span>
                    </>
                )}
                {editDate > 0 && <span>{t('EditedMessage')}&nbsp;</span>}
                <a onClick={onDateClick}>
                    <span>{dateStr}</span>
                </a>
                {is_outgoing && <Status chatId={chatId} messageId={messageId} />}
            </div>
        );
    }
}

Meta.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,
    views: PropTypes.number,
    date: PropTypes.number.isRequired,
    editDate: PropTypes.number,
    onDateClick: PropTypes.func
};

export default withTranslation()(Meta);
