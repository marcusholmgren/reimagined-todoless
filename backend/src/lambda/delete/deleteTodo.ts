import {TodoRepository} from "../todoDynamoDB";
import {AttachmentBucket} from "../todoAttachmentBucket";
import {Logger} from "winston";

/**
 * Permanently removes a specific Todo item and it's attachment
 * @param todoId
 * @param userId
 * @param repository
 * @param bucket
 * @param log
 */
export async function deleteTodo(todoId: string, userId: string, repository: TodoRepository, bucket: AttachmentBucket, log: Logger) {
    const result = await repository.delete({todoId, userId})
    await bucket.deleteAttachment(todoId)
    log.info(`Successfully deleted todo: ${JSON.stringify(result.$response.data)} or error: ${JSON.stringify(result.$response.error)}`)
}