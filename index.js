const Logger = require('./logger').Logger;
const uploadFunctions = require('./upload');
const downloadFunctions = require('./download');

exports.handler = async function(event, context, callback) {
    const logger = new Logger('lambdaHandler');

    const fileNames = await downloadFunctions.getFileNamesToDownload();
    logger.info('File names to download: ' + fileNames);

    const filesToDownload = [];
    for await (let fileName of fileNames) {
        const downloadUrl = await downloadFunctions.getDownloadUrl(fileName);
        filesToDownload.push({
            'url': downloadUrl,
            'name': fileName
        });
    }
    logger.info('Files to download: ' + JSON.stringify(filesToDownload));

    const localFiles = [];
    for await (let fileToDownload of filesToDownload) {
        const localFile = await downloadFunctions.downloadToLocal(fileToDownload.url, fileToDownload.name);
        localFiles.push(localFile);
    }
    logger.info('Local files to upload: ' + localFiles);

    for await (let localFile of localFiles) {
        await uploadFunctions.upload(localFile);
    }

    logger.info('Successfully uploaded ' + localFiles.length + ' files');

    return {
        'message': 'Successfully uploaded ' + localFiles.length + ' files'
    };
}
