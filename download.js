const https = require('https');
const fs = require('fs');
const config = require('./config');
const Logger = require('./logger').Logger;

const postData = {
    'username': config.collegeBoardConfig.username,
    'password': config.collegeBoardConfig.password
};

function collegeBoardOptionsFor(urlPath) {
    return {
        'hostname': config.collegeBoardConfig.scoredwnldHost,
        'port': config.collegeBoardConfig.scoredwnldPort,
        'path': urlPath,
        'method': 'POST',
        'rejectUnauthorized': false,
        'requestCert': true,
        'agent': false,
        'json': true,
        'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
}

function formattedDateFrom(daysAgo) {
    let formattedDate = new Date();
    formattedDate.setDate(formattedDate.getDate() - daysAgo);
    formattedDate = formattedDate.toISOString().split('.')[0] + "-0000"

    return formattedDate;
}

exports.getDownloadUrl = function(fileName) {
    return new Promise(function(resolve, reject) {
        const logger = new Logger('getDownloadUrl');
        const options = collegeBoardOptionsFor('/pascoredwnld/file?filename=' + fileName);
    
        const request = https.request(options,
            function(response) {
                let body = "";
    
                if (response.statusCode === 200) {
                    response.setEncoding('utf8');
                    response.on('data', function(data) {
                        body = body + data;
                    });
                    response.on('end', function() {
                        const jsonObj = JSON.parse(body);
                        logger.debug('JSON of file: ' + JSON.stringify(jsonObj));
                        resolve(jsonObj.fileUrl);
                    });
                } else {
                    logger.error('downloadFile failed: ' + response.statusCode);
                    reject(response.statusCode);
                }

                request.setTimeout(12000, function() {
                    logger.error('downloadFile time out');
                    reject('downloadFile time out');
                });
            });
    
        request.on('error', function(e) {
            logger.error(e);
        });
    
        request.write(JSON.stringify(postData));
        request.end();
    });
}

exports.downloadToLocal = function(url, filePath) {
    return new Promise(function(resolve, reject) {
        const logger = new Logger('downloadToLocal');
        const request = https.get(url, function(response) {
            if (response.statusCode === 200) {
                const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
                const localFilePath = '/tmp/' + fileName;

                const file = fs.createWriteStream(localFilePath);
                response.pipe(file);
                file.on('finish', function() {
                    file.close();
                    logger.debug('File Downloaded: ' + localFilePath);
                    resolve(localFilePath);
                });
            }
            request.setTimeout(30000, function() {
                logger.error('timeout');
                reject('downloadToLocal - timeout');
            });
        });
    
        request.on('error', function(e) {
            logger.error(e);
        });
    
        request.end();
    });
}

exports.getFileNamesToDownload = function(daysAgo) {
    return new Promise(function(resolve, reject) {
        const logger = new Logger('getDownloadUrl');
        let fileNames = [];
    
        const options = collegeBoardOptionsFor('/pascoredwnld/files/list?fromDate=' + formattedDateFrom(daysAgo));    
        const request = https.request(options,
            function(response) {    
                let body = "";
                if (response.statusCode === 200) {
                    response.setEncoding('utf8');
                    response.on('data', function(data) {
                        body = body + data;
                    });
    
                    response.on('end', function() {    
                        const jsonObj = JSON.parse(body);
                        logger.debug('succeeded');
                        if (jsonObj.files) {
                            for (let file of jsonObj.files) {
                                logger.debug('File name: ' + file.fileName);
                                fileNames.push(file.fileName);
                            }
                        }
                        resolve(fileNames);
                    });
                } else {
                    logger.error('getFileNamesToDownload failed: ' + response.statusCode);
                    reject(response.statusCode);
                }

                request.setTimeout(12000, function() {
                    logger.error('timeout');
                    reject('getDownloadableFiles time out');
                });
            });
    
        request.write(JSON.stringify(postData));
        request.end();
    });
}

