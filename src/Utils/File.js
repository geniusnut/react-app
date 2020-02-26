import FileStore from '../Stores/FileStore';
import UserStore from '../Stores/UserStore';
import axios from "axios";

function getSrc(file) {
    const dataUrl = file && FileStore.getDataUrl(file.id);
    if (dataUrl) return dataUrl;

    const blob = getBlob(file);

    return FileStore.getBlobUrl(blob) || '';
}

function getBlob(file) {
    return file ? FileStore.getBlob(file.id) || file.blob : null;
}


function getAvatar(url) {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

export {
    getBlob,
    getSrc,
}