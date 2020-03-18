import * as React from "react";
import classNames from 'classnames';
import DocumentTile from "../Tile/DocumentTile";
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import DocumentAction from "./DocumentAction";
import {getExtension} from "../../Utils/File";
import './Document.css';

class Document extends React.Component {
    downloadFile = event => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        fetch(this.props.document.url)
            .then(response => {
                response.blob().then(blob => {
                    let url = window.URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    a.href = url;
                    a.download = this.props.title;
                    a.click();
                });
            });
    };

    render() {
        const { document, openMedia, width, height, meta, title } = this.props;

        console.log("document: ", document)
        const { name, md5, url } = document;
        const file = document;

        const style = width && height ? { width, height } : null;

        return (
            <div className={classNames('document', { 'media-title': title })} style={style}>
                <DocumentTile
                    file={file}
                    openMedia={openMedia}
                    chatId={this.props.chatId}
                    messageId={this.props.messageId}
                    icon={<ArrowDownwardIcon />}
                    completeIcon={<InsertDriveFileIcon />}
                />
                <div className='document-content'>
                    <div className='document-title'>
                        <a
                            onClick={this.downloadFile}
                            className='document-name'
                            title={name}
                            data-name={name}
                            data-ext={'.' + getExtension(name)}>
                            {name}
                        </a>
                    </div>
                    <DocumentAction file={document} meta={meta} />
                </div>
            </div>
        );
    }
}

export default Document;