import * as React from "react";
import classNames from 'classnames';
import * as PropTypes from "prop-types";
import MessageStore from "../../Stores/MessageStore";
import {PHOTO_DISPLAY_SIZE, PHOTO_SIZE, PHOTO_THUMBNAIL_SIZE} from "../../Constants";
import {getFitSize} from "../../Utils/Common";
import './Photo.css';

class Photo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const { className, displaySize, chatId, messageId, openMedia, type, src} = this.props;
        const message = MessageStore.get(chatId, messageId);

        // const fitPhotoSize = getFitSize(photoSize, displaySize, false);
        // if (!fitPhotoSize) return null;
        //
        // const photoStyle = {
        //     width: fitPhotoSize.width,
        //     height: fitPhotoSize.height,
        //     ...style
        // };
        return (
            <div
                className={classNames(className, 'photo', {
                    'photo-big': type === 'message',
                    pointer: openMedia
                })}
                // style={photoStyle}
                onClick={openMedia}>
                {src && (
                    <img
                        className={classNames('photo-image')}
                        draggable={false}
                        src={src}
                        alt=''
                    />
                )}
                {/*{showProgress && <FileProgress file={photoSize.photo} download upload cancelButton />}*/}
            </div>
        );
    }
}

Photo.propTypes = {
    chatId: PropTypes.string,
    messageId: PropTypes.string,
    photo: PropTypes.object.isRequired,
    openMedia: PropTypes.func,
};

Photo.defaultProps = {
    size: PHOTO_SIZE,
    thumbnailSize: PHOTO_THUMBNAIL_SIZE,
    displaySize: PHOTO_DISPLAY_SIZE,
    showProgress: true
};

export default Photo;