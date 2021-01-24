import 'source-map-support/register'
import {DynamoDB} from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {createLogger} from "../../utils/logger";

const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    // TODO: Remove a TODO item by id
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
}
