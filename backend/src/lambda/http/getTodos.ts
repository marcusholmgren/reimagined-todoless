import 'source-map-support/register'
import {DynamoDB, S3} from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {getUserId} from "../utils";
import {TodoItem} from "../../models/TodoItem";

const s3 = new S3({ signatureVersion: 'v4' })
const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')
const bucket = process.env.TODOS_ATTACHMENT_BUCKET


export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)

    const params: DynamoDB.DocumentClient.QueryInput = {
        TableName: process.env.TODOS_DYNAMODB_TABLE,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    };

    try {
        const result = await dynamo.query(params).promise();

        try {
            result.Items.forEach((item: TodoItem) => {
                const url = getSignedUrl(item.todoId)
                item.attachmentUrl = url;
            })
        } catch (e) {
            log.error(`Failed to get signedUrl: ${e}`)
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({items: result.Items}),
        };
        return response
    } catch (error) {
        const message = `Failed to get todos: ${error}`
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
        Expires: 3600,
    }

    return s3.getSignedUrl('getObject', params)
}