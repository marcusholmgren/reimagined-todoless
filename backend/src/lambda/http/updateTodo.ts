import 'source-map-support/register'
import {DynamoDB} from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import {createLogger} from "../../utils/logger";

const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    log.info(`Patch request item: ${updatedTodo}`)

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: process.env.TODOS_DYNAMODB_TABLE,
        Key: {
            todoId: todoId
        },
        ExpressionAttributeNames: {
            '#todo_name': 'name',
        },
        ExpressionAttributeValues: {
            ':done': updatedTodo.done,
            ':dueDate': updatedTodo.dueDate,
            ':name': updatedTodo.name
        },
        UpdateExpression: 'SET #todo_name = :name, done = :done, dueDate = :dueDate',
        ReturnValues: 'ALL_NEW'
    }

    log.info(params)

    try {
        const result = await dynamo.update(params).promise()

        log.info(`Update result: ${result.Attributes}`)
        const response = {
            statusCode: 204,
            body: JSON.stringify({})
        }
        return response
    } catch (error) {
        const message = `Failed to update todo: ${error}`
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
