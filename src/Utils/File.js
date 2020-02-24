import FileStore from '../Stores/FileStore';

function getSrc(file) {
    const dataUrl = file && FileStore.getDataUrl(file.id);
    if (dataUrl) return dataUrl;

    const blob = getBlob(file);

    return FileStore.getBlobUrl(blob) || '';
}

function getBlob(file) {
    return file ? FileStore.getBlob(file.id) || file.blob : null;
}

export {
    getBlob,
    getSrc,
}