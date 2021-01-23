import 'source-map-support/register'
import {v4 as uuidv4} from 'uuid'
import { DynamoDB } from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {TodoItem} from "../../models/TodoItem";
import {createLogger} from "../../utils/logger";
// @ts-ignore
import {getUserId} from "../utils";

const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = 'marcus' //getUserId(event)

    const todoItem: TodoItem = {
        ...newTodo,
        todoId: uuidv4(),
        userId: userId,
        done: false,
        createdAt: new Date().toISOString()
    }

    const params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: process.env.TODOS_DYNAMODB_TABLE,
        Item: todoItem
    };

    try {
        const results = await dynamo.put(params).promise()
        log.info(`Stored message in DynamoDB. ${results.Attributes}`)


        const response = {
            statusCode: 201,
            body: JSON.stringify(params.Item),
        };

        return response
        // TODO: Implement creating a new TODO item
        // return undefined
    } catch (error) {
        const message = `Failed to store TODO item. ${error}`
        log.error(message)
        const response = {
            statusCode: 400,
            body: JSON.stringify({ error: message})
        }
        return response
    }
}
