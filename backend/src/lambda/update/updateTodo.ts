import {TodoRepository} from "../todoDynamoDB";
import {Logger} from "winston";
import {TodoUpdate} from "../../models/TodoUpdate";


/**
 * Update a specific Todo item with new data
 * @param todoId
 * @param userId
 * @param todoUpdate
 * @param repository
 * @param log
 */
export async function updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate, repository: TodoRepository, log: Logger) {
    log.info(`Patch request item: ${JSON.stringify(todoUpdate)}`)
    const result = await repository.update({todoId, userId}, todoUpdate)
    log.info(`Update result: ${JSON.stringify(result.$response.data)} or error: ${JSON.stringify(result.$response.error)}`)
    return result
}
