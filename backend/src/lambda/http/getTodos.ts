import 'source-map-support/register'
import { DynamoDB } from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'
import {createLogger} from "../../utils/logger";

const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')

// @ts-ignore
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user

    const params: DynamoDB.DocumentClient.ScanInput = {
        TableName: process.env.TODOS_DYNAMODB_TABLE,
    };

    try {
        const result = await dynamo.scan(params).promise();

        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
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
}
