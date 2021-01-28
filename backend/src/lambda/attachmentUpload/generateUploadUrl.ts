import {TodoRepository} from "../todoDynamoDB";
import {AttachmentBucket} from "../todoAttachmentBucket";
import * as winston from "winston";

/**
 * Get upload url and update todo item with flag that it contains attachment
 * @param todoId
 * @param userId
 * @param repository
 * @param bucket
 */
export async function generateUploadUrl(todoId: string, userId: string, repository: TodoRepository, bucket: AttachmentBucket, log: winston.Logger): Promise<string | undefined> {
    const todoKey = {todoId, userId}

    const item = await repository.get(todoKey)

    if (item.Item) {
        log.info(`Get signed url for todoId: ${todoId} and userId: ${userId}`)
        const url = bucket.getUploadUrl(todoId)
        log.info(`Got signed url for todoId: ${todoKey} and userId: ${userId}`)
        await repository.updateHaveAttachment(todoKey)
        log.info(`Updated todoId: ${todoId} and userId: ${userId} with flag for attachment`)
        return url
    } else {
        return;
    }
}