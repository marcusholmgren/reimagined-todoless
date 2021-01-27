import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const dynamo = new XAWS.DynamoDB.DocumentClient();
const log = createLogger('todoless')
const bucket = process.env.TODOS_ATTACHMENT_BUCKET

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
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
            await updateItem(todoId)
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

/**
 * Get a signed Url for uploading a file to S3 bucket
 * @param key Name of file in S3 bucket
 */
function getSignedUrl(key: string): string {
    const params = {
        Bucket: bucket,
        Key: `${key}`,
        Expires: 300,
    }

    return s3.getSignedUrl('putObject', params)
}


/**
 * Updates TODO item with attachmentUrl value
 * @param todoId Identity field of TODO item
 */
async function updateItem(todoId: string) {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: process.env.TODOS_DYNAMODB_TABLE,
        Key: {
            todoId: todoId
        },
        ExpressionAttributeValues: {
            ':attachmentUrl': `${todoId}`,
        },
        UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
        ReturnValues: 'ALL_NEW'
    }

    try {
        await dynamo.update(params).promise()
    } catch (error) {
        const message = `Failed to update todo: ${error}`
        log.error(message)
    }
}