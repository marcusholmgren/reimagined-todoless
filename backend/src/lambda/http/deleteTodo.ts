import 'source-map-support/register'
import {DynamoDB} from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {createLogger} from "../../utils/logger";

const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    const params: DynamoDB.DocumentClient.DeleteItemInput = {
        TableName: process.env.TODOS_DYNAMODB_TABLE,
        Key: {
            todoId: todoId
        }
    }

    try {
        const result = await dynamo.delete(params).promise();
        log.info(`Successfully deleted todo: ${result.$response}`)

        const response = {
            statusCode: 204,
            body: JSON.stringify({}),
        };
        return response
    } catch (error) {
        const message = `Failed to delete todo: ${error}`
        log.error(message)
        const response = {
            statusCode: 400,
            body: JSON.stringify({error: message})
        }
        return response
    }
}).use(cors(
    { credentials: true }
    )
)
