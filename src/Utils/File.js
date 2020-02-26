import FileStore from '../Stores/FileStore';
import UserStore from '../Stores/UserStore';
import axios from "axios";
import IMController from '../Controllers/IMController';

function getSrc(url) {
    const blob = FileStore.get(url);
    if (blob == null) {
        IMController.downloadFile(url);
    }
    return blob;
}

function getBlob(file) {
    return file ? FileStore.getBlob(file.id) || file.blob : null;
}


function getAvatar(url) {
    return axios.get('https://www.gravatar.com/avatar/7ad5ab35f81ff2a439baf00829ee6a23', {
            responseType: 'arraybuffer'
        })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

function getRemoteFile(url) {
}

export {
    getBlob,
    getSrc,
    getRemoteFile,
}