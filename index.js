var https = require('https');
var fs = require('fs');
var Client = require('ssh2-sftp-client');

//from Collegeboard, change username and password to your college board credentials
var initConfig = {
    scoredwnldHost: 'scoresdownload.collegeboard.org',
    scoredwnldPort: '443',
    username: 'username',
    password: 'password'
};

var connSettings = {
    host: 'host',
    username: 'username',
    password: 'password',
    port: 22,
    readyTimeout: 50000,
    remotePath: 'path'
};


var downloadFile = function(config, fileName) {
    return new Promise((resolve, reject) => {
        var postData = {
            "username": config.username,
            "password": config.password
        };
        var options = {
            hostname: config.scoredwnldHost,
            port: config.scoredwnldPort,
            path: '/pascoredwnld/file?filename=' + fileName,
            method: 'POST',
            rejectUnauthorized: false,
            requestCert: true,
            agent: false,
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
    
        var request = https.request(options,
            function(response) {
                var body = "";
    
                if (response.statusCode === 200) {
                    response.setEncoding('utf8');
                    response.on('data', function(data) {
                        body = body + data;
                    });
                    response.on('end', function() {
                        var jsonObj = JSON.parse(body);
                        console.log('');
                        console.log('downloadFile - file url obtained: ');
                        console.log('');
                        console.log(jsonObj);
                        resolve({
                            url: jsonObj.fileUrl,
                            path: jsonObj.filePath,
                            localPath: '/tmp/'
                        });
                    });
                } else {
                    console.log('');
                    console.log('downloadFile failed: ' + response.statusCode);
                    reject(response.statusCode);
                }
                // Add timeout.
                request.setTimeout(12000, function() {
                    console.log('');
                    console.log('downloadFile time out');
                    reject('downloadFile time out');
                });
            });
    
        request.on('error', (e) => {
            console.error(e);
        });
    
        request.write(JSON.stringify(postData));
        request.end();
    });
};


var downloadCopyAndFTP = function(url, filePath, localFilePath) {
    return new Promise((resolve, reject) => {
        var request = https.get(url, function(response) {
            if (response.statusCode === 200) {
                var fileName = null; //response.headers['content-disposition'].split('filename=')[1];
                if (!fileName) {
                    fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
                }
                var file = fs.createWriteStream(localFilePath + fileName);
                response.pipe(file);
                file.on('finish', function() {
                    file.close();
                    console.log('');
                    console.log('File Downloaded: ' + localFilePath + fileName);
                    resolve(localFilePath + fileName);
                });
            }
            request.setTimeout(30000, function() {
                console.log('');
                console.log('download time out');
                reject('download file timeout');
            });
        });
    
        request.on('error', (e) => {
            console.error(e);
        });
    
        request.end();
    });
};

//TJH DownloadFilesWithDate is the function Loyola University Chicago uses to download files that
//have been made available within X days (NumberOfDays) from the day the script
//is being run.

var DownloadFilesWithDate = function(config, NumberOfDays) {
    return new Promise((resolve, reject) => {
        var fileNames = [];
        var postData = {
            "username": config.username,
            "password": config.password
        };
        var myDate = new Date();
        myDate.setDate(myDate.getDate() - NumberOfDays);
        //this line is here because the default format for date is Zulu format
        //SAT Webservice want the date in this format:
        //2017-03-28T22:13:23-0000
        //Zulu format would be 2017-03-28T22:13:23.000Z
        myDate = myDate.toISOString().split('.')[0] + "-0000"
        //console.log(myDate);
    
        var options = {
            hostname: config.scoredwnldHost,
            port: config.scoredwnldPort,
            path: '/pascoredwnld/files/list?fromDate=' + myDate,
            method: 'POST',
            rejectUnauthorized: false,
            requestCert: true,
            agent: false,
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
    
        var request = https.request(options,
            function(response) {
                console.log("1");
    
                var body = "";
                if (response.statusCode === 200) {
                    response.setEncoding('utf8');
                    response.on('data', function(data) {
                        body = body + data;
                    });
    
    
                    response.on('end', function() {
    
                        var jsonObj = JSON.parse(body);
    
                        console.log('');
                        console.log('getDownloadableFiles succeeded');
                        console.log('');
    
                        //TJH Notes
                        // "files" in jsonObj is the first level returned by the Webservice.
                        //it is not a nodejs command or any other command. It is what collegeboard
                        //decided to call the first JSON level.
                        //We iterate through each returned files
    
                        if (jsonObj.files) {
                            console.log("I got files!");
                            var keys = Object.keys(jsonObj.files);
                            for (var i = 0, length = keys.length; i < length; i++) {
                                //filename is the returned value located in the JSON
                                console.log(jsonObj.files[i].fileName);
                                fileNames.push(jsonObj.files[i].fileName);
    
                            }
    
                        }
                        resolve(fileNames);
                    });
                } else {
                    console.log('');
                    console.log('getDownloadableFiles failed: ' + response.statusCode);
                    reject(response.statusCode);
                }
                // Add timeout.
                request.setTimeout(12000, function() {
                    console.log('');
                    console.log('getDownloadableFiles time out');
                    reject('getDownloadableFiles time out');
                });
            });
    
        request.write(JSON.stringify(postData));
        request.end();
    });
};


var UploadToFTP = function(fileToUpload) {
        let sftp = new Client();
        let fileParts = fileToUpload.split('/');
        let remotePath = connSettings.remotePath + fileParts[fileParts.length - 1];
        console.log('uploading ' + fileToUpload + ' as ' + remotePath);
         
        return sftp.connect(connSettings)
          .then(() => {
            return sftp.put(fileToUpload, remotePath);
          })
          .then(() => {
            return sftp.end();
          })
          .catch(err => {
            console.error(err.message);
          });
};



exports.handler = async (event, context, callback) => {
    const fileNames = await DownloadFilesWithDate(initConfig, 1);
    console.log('after download');
    console.log('fileNames: ' + fileNames);


    const downloadDataList = [];
    for await (let fileName of fileNames) {
        const downloadData = await downloadFile(initConfig, fileName);
        downloadDataList.push(downloadData);

    }
    console.log('after download data');
    console.log('downloadData: ' + JSON.stringify(downloadDataList));

    const localFiles = [];
    for await (let downloadData of downloadDataList) {
        const localFile = await downloadCopyAndFTP(downloadData.url, downloadData.path, downloadData.localPath);
        localFiles.push(localFile);
    }


    console.log('after downloadcopy and ftp data');
    console.log('localFiles: ' + localFiles);

    for await (let localFile of localFiles) {
        await UploadToFTP(localFile);
    }
};

