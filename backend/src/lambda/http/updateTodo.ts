import 'source-map-support/register'
import {DynamoDB} from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {createLogger} from "../../utils/logger";

const dynamo = new DynamoDB.DocumentClient();
const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: process.env.TODOS_DYNAMODB_TABLE,
    Key: {
      id: todoId
    },
    ExpressionAttributeValues: {
      ':done': updatedTodo.done,
      ':dueDate': updatedTodo.dueDate,
      ':name': updatedTodo.name
    },
    UpdateExpression: 'SET done = :done, dueDate = :dueDate, name = :name',
    ReturnValues: 'ALL_NEW'
  }

  try {
    const result = await dynamo.update(params).promise()

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.$response)
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
}
