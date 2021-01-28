import * as AWS from 'aws-sdk'
import {AttachmentBucket} from "../todoAttachmentBucket";
import {TodoRepository} from "../todoDynamoDB";
import {TodoItem} from "../../models/TodoItem";
import {PromiseResult} from "aws-sdk/lib/request";

/**
 * Get Todo items for the specified user
 * @param userId
 * @param repository
 * @param bucket
 */
export async function getTodos(userId: string, repository: TodoRepository, bucket: AttachmentBucket):  Promise<PromiseResult<AWS.DynamoDB.DocumentClient.QueryOutput, AWS.AWSError>> {
    const todoItems = await repository.queryByUser(userId)

    // give items with attachment a signed url for the attachment
    todoItems.Items
        .filter((item: TodoItem) => item.attachmentUrl)
        .forEach((item: TodoItem) => {
            item.attachmentUrl = bucket.getSignedUrl(item.todoId);
        })

    return todoItems
}
