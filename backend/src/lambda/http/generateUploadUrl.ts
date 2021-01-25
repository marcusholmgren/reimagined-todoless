import 'source-map-support/register'
import {DynamoDB, S3} from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";

const s3 = new S3({ signatureVersion: 'v4' })
const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')
const bucket = process.env.TODOS_ATTACHMENT_BUCKET

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    const params: DynamoDB.DocumentClient.QueryInput = {
        TableName: process.env.TODOS_DYNAMODB_TABLE,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
            ':todoId': todoId
        }
    }

    log.info(`Get signed url for todoId: ${todoId} to bucket: ${bucket}`)
    try {
        const item = await dynamo.query(params).promise()

        if (item.Count > 0) {
            const url = getSignedUrl(todoId)
            // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
            return {
                statusCode: 200,
                body: JSON.stringify({uploadUrl: url})
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({error: 'Could not find the item with the given todoId'})
            }
        }
    } catch (error) {
        const message = `Failed to generate upload URL: ${error}`
        log.error(message)
        const response = {
            statusCode: 400,
            body: JSON.stringify({error: message})
        }
        return response
    }
}).use(cors(
    {credentials: true}
    )
)


function getSignedUrl(key: string): string {
    const params = {
        Bucket: bucket,
        Key: `${key}`,
        Expires: 300,
    }

    return s3.getSignedUrl('putObject', params)
}