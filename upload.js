const SftpClient = require('ssh2-sftp-client');
const config = require('./config');
const Logger = require('./logger').Logger;

exports.upload = function(fileToUpload) {
    const logger = new Logger('upload');
    const sftp = new SftpClient();
    const fileParts = fileToUpload.split('/');
    const remotePath = config.sftpConfig.remotePath + fileParts[fileParts.length - 1];
    logger.info('Uploading ' + fileToUpload + ' as ' + remotePath);
         
    return sftp.connect(config.sftpConfig)
        .then(function() {
            return sftp.put(fileToUpload, remotePath);
        })
        .then(function() {
            return sftp.end();
        })
        .catch(function(err) {
            logger.error(err.message);
        });
}
