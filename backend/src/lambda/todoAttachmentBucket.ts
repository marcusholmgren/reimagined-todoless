import * as AWS from "aws-sdk";
import {PromiseResult} from "aws-sdk/lib/request";


export interface AttachmentBucket {
    getSignedUrl(key: string): string;

    getUploadUrl(key: string): string

    deleteAttachment(todoId: string): Promise<PromiseResult<AWS.S3.DeleteObjectOutput, AWS.AWSError>>
}

export class TodoAttachmentS3 implements AttachmentBucket {
    constructor(private readonly s3: AWS.S3,
                private readonly bucket: string) {
    }


    getSignedUrl(key: string): string {
        const params = {
            Bucket: this.bucket,
            Key: `${key}`,
            Expires: 3600,
        }

        return this.s3.getSignedUrl('getObject', params)
    }

    /**
     * Get a signed Url for uploading a file to S3 bucket
     * @param key Name of file in S3 bucket
     */
    getUploadUrl(key: string): string {
        const params = {
            Bucket: this.bucket,
            Key: `${key}`,
            Expires: 30,
        }

        return this.s3.getSignedUrl('putObject', params)
    }


    async deleteAttachment(todoId: string): Promise<PromiseResult<AWS.S3.DeleteObjectOutput, AWS.AWSError>> {

        const params: AWS.S3.DeleteObjectRequest = {
            Bucket: this.bucket,
            Key: `${todoId}`
        }

        return await this.s3.deleteObject(params).promise()
    }
}