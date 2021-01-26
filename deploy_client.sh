#!/bin/bash

# https://blog.eq8.eu/til/create-aws-s3-bucket-as-static-website-with-cli.html

echo '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::marcus-reimagined-todoless/*"
        }
    ]
}' > /tmp/bucket_policy.json

aws s3api create-bucket --bucket marcus-reimagined-todoless --region eu-central-1  --create-bucket-configuration LocationConstraint=eu-central-1 --profile default \
  && aws s3api put-bucket-policy --bucket marcus-reimagined-todoless --policy file:///tmp/bucket_policy.json --profile default \
  && aws s3 sync client/build s3://marcus-reimagined-todoless/  --profile default \
  && aws s3 website s3://marcus-reimagined-todoless/ --index-document index.html --error-document index.html --profile default