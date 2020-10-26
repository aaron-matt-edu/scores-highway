# scores-highway

This is a [NodeJS](https://nodejs.org/en/download/) AWS Lambda function that [downloads test scores from Collegeboard](https://collegereadiness.collegeboard.org/educators/higher-ed/reporting-portal-help) & uploads them to an SFTP server daily.

## Credits

This function was adapted from a script originally developed by [Tim Heuer](mailto:theuer@luc.edu) (773.508.3254) of Loyola University Chicago, circa March 31, 2017.

## Installation instructions

1. Install [Git](https://git-scm.com/), NodeJS, [serverless](https://serverless.com), & the [AWS CLI](https://aws.amazon.com/cli/).
1. Create an AWS account.
1. Create an [AWS Elastic IP address](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html).

1. Create the AWS VPC stack with the following replacements:

    * `<IP>` with the Elastic IP created earlier (e.g. eipalloc-xxxxxxxx)
    * `<Availability Zone>` with the desired [AWS Availability Zone](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) (e.g. us-east-2a)

    ```bash
    aws cloudformation create-stack --stack-name scores-highway-prd-vpc --template-body file://cloudformation.yml --parameters ParamterKey=ElasticIPParameter,ParameterValue=<IP> ParameterKey=AvailabilityZoneParameter,ParameterValue=<Availability Zone> --capabilities CAPABILITY_NAMED_IAM
    ```

1. Add the IP address to the whitelist for the SFTP server.
1. Clone this repository.

    ```bash
    git clone https://github.com/aaron-matt-edu/scores-highway.git
    ```

1. Deploy the AWS Lambda function with the following replacements:

    * `<AWS Region>` with your desired AWS region
    * `<CB user name>` with your Collegeboard user name
    * `<CB password>` with your Collegeboard password
    * `<SFTP user name>` with your SFTP user name
    * `<SFTP password>` with your SFTP password
    * `<SFTP host>` with your SFTP host name
    * `<SFTP path>` with your SFTP destination path

    ```bash
    npm install serverless-plugin-include-dependencies --save-dev && serverless deploy --region <AWS region> --cb-user-name <CB user name> --cb-password <CB password> --sftp-user-name <SFTP user name> --sftp-password <SFTP password> --sftp-host <SFTP host> --sftp-path <SFTP path>
    ```
