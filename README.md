# scores-highway

This is a [NodeJS](https://nodejs.org/en/download/) AWS Lambda function that [downloads test scores from Collegeboard](https://collegereadiness.collegeboard.org/educators/higher-ed/reporting-portal-help) & uploads them to an SFTP server daily.

## Credits

This function was adapted from a script originally developed by [Tim Heuer](mailto:theuer@luc.edu) (773.508.3254) of Loyola University Chicago, circa March 31, 2017.

## Installation instructions

1. Create an AWS account.
1. [Create an AWS VPC with a static public IP address](https://medium.com/@karan.brar/aws-lambda-with-static-ip-address-c82e3043c2ed) (follow the linked guide except for the part that creates the AWS Lambda function).
1. Add the IP address to the whitelist for the SFTP server.
1. Install NodeJS, [serverless](https://serverless.com), & the [AWS CLI](https://aws.amazon.com/cli/). When setting up the AWS CLI, if using a region other than `us-east-2`, then you'll need to update the `region` in `serverless.yml` as well as elsewhere in this guide.
1. Clone this repository.

    ```bash
    git clone https://github.com/aaron-matt-edu/scores-highway.git
    ```

1. Create an AWS IAM role with the following policy with the following replacements:

    * `<AWS account number>` with your AWS account number

    ```javascript
    {
        "Version": "2012-10-17",
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
            {
                "Sid": "VisualEditor1",
                "Effect": "Allow",
                "Action": "logs:CreateLogGroup",
                "Resource": "arn:aws:logs:us-east-2:<AWS account number>:*"
            },
            {
                "Sid": "VisualEditor2",
                "Effect": "Allow",
                "Action": [
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": "arn:aws:logs:us-east-2:<AWS account number>:log-group:/aws/lambda/scores-highway-prd:*"
            }
        ]
    }
    ```

1. Install `serverless-plugin-include-dependencies`:

    ```bash
    npm install serverless-plugin-include-dependencies
    ```

1. Deploy the AWS Lambda function with the following replacements:

    * `<CB user name>` with your Collegeboard user name
    * `<CB password>` with your Collegeboard password
    * `<SFTP user name>` with your SFTP user name
    * `<SFTP password>` with your SFTP password
    * `<SFTP host>` with your SFTP host name
    * `<SFTP path>` with your SFTP destination path
    * `<Role ARN>` with the ARN of the role previously created
    * `<Security Group ARN>` with the ARN of the security group for the VPC previously created
    * `<Subnet ARN>` with the ARN of the private subnet previously created

    ```bash
    serverless deploy --cb-user-name <CB user name> --cb-password <CB password> --sftp-user-name <SFTP user name> --sftp-password <SFTP password> --sftp-host <SFTP host> --sftp-path <SFTP path> --role-arn <Role ARN> --security-group-id <Security Group ARN> --subnet-id <Subnet ARN>
    ```

## Notes

This is merely a 1.0.0 version of the function. There is a small backlog of enhancements, code clean-up, & automation coming to make the lengthy installation instructions much easier.
