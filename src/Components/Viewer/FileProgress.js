/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';
import { ANIMATION_DURATION_300MS } from '../../Constants';
import FileStore from '../../Stores/FileStore';
import './FileProgress.css';

const circleStyle = { circle: 'file-progress-circle' };

class FileProgress extends React.Component {
    constructor(props) {
        super(props);

        this.completeAnimation = false;
        const { file } = this.props;
        this.state = {
            progress: null,
            prevPropsFile: file,
            prevFile: null,
        };
    }

    componentDidMount() {
        this.mount = true;
        FileStore.on('clientUpdateProgress', this.onUpdateProgress);
    }

    componentWillUnmount() {
        this.mount = false;
        FileStore.off('clientUpdateProgress', this.onUpdateProgress);
    }


    onUpdateProgress = update => {
        const {chatId, messageId} = this.props;
        const {chat_id, message_id, progress} = update
        if (chatId !== chat_id || messageId !== message_id) {
            return
        }
        this.state.progress = progress;
        this.forceUpdate()
    }


    render() {
        const {progress} = this.state;
        const  inProgress = progress < 100;
        if (inProgress) {
            return (
                <div className='file-progress' >
                    <div className='file-progress-indicator'>
                        <CircularProgress
                            classes={circleStyle}
                            variant='static'
                            value={progress}
                            size={42}
                            thickness={2}
                        />
                    </div>
                </div>
            );
        }

        return null;
    }
}

FileProgress.propTypes = {
    file: PropTypes.object.isRequired,
    thumbnailSrc: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    cancelButton: PropTypes.bool,
    download: PropTypes.bool,
    upload: PropTypes.bool,
    zIndex: PropTypes.number,

    icon: PropTypes.node,
    completeIcon: PropTypes.node
};

FileProgress.defaultProps = {
    cancelButton: false,
    download: true,
    upload: false
};

export default FileProgress;
