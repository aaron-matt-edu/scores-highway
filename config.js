exports.collegeBoardConfig = {
    'scoredwnldHost': 'scoresdownload.collegeboard.org',
    'scoredwnldPort': '443',
    'username': process.env.CB_USER_NAME,
    'password': process.env.CB_PASSWORD
};

exports.sftpConfig = {
    'host': process.env.SFTP_HOST,
    'username': process.env.SFTP_USER_NAME,
    'password': process.env.SFTP_PASSWORD,
    'port': 22,
    'readyTimeout': 50000,
    'remotePath': process.env.SFTP_PATH
};
