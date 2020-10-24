# scores-highway

This is a [NodeJS](https://nodejs.org/en/download/) AWS Lambda function that [downloads test scores from Collegeboard](https://collegereadiness.collegeboard.org/educators/higher-ed/reporting-portal-help) & uploads them to an SFTP server daily.

## Credits

This function was adapted from a script originally developed by [Tim Heuer](mailto:theuer@luc.edu) (773.508.3254) of Loyola University Chicago, circa March 31, 2017.

## Installation instructions

1. Create an AWS account.
1. [Create an AWS Lambda function with a static IP address](https://medium.com/@karan.brar/aws-lambda-with-static-ip-address-c82e3043c2ed).
1. Add the IP address to the whitelist for the SFTP server.
1. Install NodeJS.
1. Clone this repository.

    ```bash
    git clone https://github.com/aaron-matt-edu/scores-highway.git
    ```

1. Update the `sftpConfig` object in `config.js` with the info for your target SFTP server.
1. Update the `collegeBoardConfig` object in `config.js` with your Collegeboard credentials.

1. Create AWS Lambda function ZIP file.

    ```bash
    npm run clean && npm install && npm run package
    ```

1. Under the "Function code" section of the AWS Lambda function, choose Actions -> Upload ZIP file. Upload `bin/scores-highway.zip`.
1. Under the "Basic settings" section of the AWS Lambda function, set the timeout to 10 minutes.
1. Under the "Configuration" section of the AWS Lambda function, choose "Add Trigger" & create an EventBridge (CloudWatch events) trigger with the following CRON schedule: `cron(0 H * * ? *)` where H is the hour of the day you'd like this function to run daily (UTC time, 24-hour format).
1. Under the "Permissions" section of the AWS Lambda function, update the function's execution role to add this statement:

    ```javascript
    "Statement": [
    {
        "Effect": "Allow",
        "Action": [
            "ec2:DescribeNetworkInterfaces",
            "ec2:CreateNetworkInterface",
            "ec2:DeleteNetworkInterface",
            "ec2:DescribeInstances",
            "ec2:AttachNetworkInterface"
        ],
        "Resource": "*"
    },
    ```

## Notes

This is merely a 1.0.0 version of the function. There is a small backlog of enhancements, code clean-up, & automation coming to make the lengthy installation instructions much easier.
