import 'source-map-support/register'
// @ts-ignore
import {DynamoDB, S3} from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // @ts-ignore
  const todoId = event.pathParameters.todoId


  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return undefined
}

// @ts-ignore
function getSignedUrl(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key
  }

  const s3 = new S3()
  return s3.getSignedUrl('getObject', params)
}