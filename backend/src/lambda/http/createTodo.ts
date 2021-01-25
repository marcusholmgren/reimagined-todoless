import 'source-map-support/register'
import {v4 as uuidv4} from 'uuid'
import { DynamoDB } from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {TodoItem} from "../../models/TodoItem";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../utils";

const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

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
        log.info(`Stored message in DynamoDB. ${results.$response}`)


        const response = {
            statusCode: 201,
            body: JSON.stringify({ item: params.Item }),
        };

        return response
    } catch (error) {
        const message = `Failed to store TODO item. ${error}`
        log.error(message)
        const response = {
            statusCode: 400,
            body: JSON.stringify({ error: message})
        }
        return response
    }
}).use(cors(
    { credentials: true }
    )
)
