import 'source-map-support/register'
import {DynamoDB} from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {getUserId} from "../utils";

const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')


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
