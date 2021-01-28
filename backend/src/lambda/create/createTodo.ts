import {v4 as uuidv4} from 'uuid'
import * as AWS from 'aws-sdk'
import {AWSError} from 'aws-sdk'
import {PromiseResult} from "aws-sdk/lib/request";
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {TodoItem} from "../../models/TodoItem";
import {createLogger} from "../../utils/logger";
import {TodoRepository} from "../todoDynamoDB";

const log = createLogger('todoless')

/**
 * Persist a new TODO item in database
 * @param userId
 * @param newTodo
 * @param repository
 */
export async function createTodo(userId: string, newTodo: CreateTodoRequest, repository: TodoRepository): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.PutItemOutput, AWSError>> {
    const newItem = createTodoItem(userId, newTodo)

    const results = await repository.create(newItem)
    log.info(`Stored message in DynamoDB. ${JSON.stringify(results.$response.data)} or error: ${JSON.stringify(results.$response.error)}`)

    return results
}

function createTodoItem(userId: string, newTodo: CreateTodoRequest): TodoItem {
    return {
        ...newTodo,
        todoId: uuidv4(),
        userId: userId,
        done: false,
        createdAt: new Date().toISOString()
    }
}
