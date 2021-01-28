import {TodoItem} from "../models/TodoItem";
import {PromiseResult} from "aws-sdk/lib/request";
import * as AWS from "aws-sdk";
import {TodoUpdate} from "../models/TodoUpdate";


/**
 * Todo item storage
 */
export interface TodoRepository {
    /**
     * Persist a new Todo item
     * @param newItem
     */
    create(newItem: TodoItem): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>;

    /**
     * Get all Todo items for a user
     * @param userId
     */
    queryByUser(userId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.QueryOutput, AWS.AWSError>>;

    /**
     * Get a specific Todo with identity key
     * @param key - identity key
     */
    get(key: TodoTableKey): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.GetItemOutput, AWS.AWSError>>

    /**
     * Update a Todo item with identity key
     * @param key - identity key
     * @param todoUpdate - values to updated
     */
    update(key: TodoTableKey, todoUpdate: TodoUpdate): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>

    /**
     * Flag Todo item that it have attachment
     * @param key - identity key
     */
    updateHaveAttachment(key: TodoTableKey): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>

    /**
     * Permanently remove a Todo item with identity key
     * @param key - identity key
     */
    delete(key: TodoTableKey): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.DeleteItemOutput, AWS.AWSError>>
}

type TodoTableKey = {
    todoId: string,
    userId: string
}

export class TodoDynamoDB implements TodoRepository {
    constructor(private readonly dynamo: AWS.DynamoDB.DocumentClient,
                private readonly tableName: string) {
    }

    async create(newItem: TodoItem): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.tableName,
            Key: {
                todoId: newItem.todoId,
                userId: newItem.userId
            },
            ExpressionAttributeNames: {
                '#todo_name': 'name',
            },
            ExpressionAttributeValues: {
                ':done': newItem.done,
                ':dueDate': newItem.dueDate,
                ':name': newItem.name,
                ':createdAt': newItem.createdAt,
            },
            UpdateExpression: 'SET #todo_name = :name, done = :done, dueDate = :dueDate, createdAt = :createdAt',
            ReturnValues: 'ALL_NEW'
        }

        return await this.dynamo.update(params).promise()
    }

    async queryByUser(userId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.QueryOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: this.tableName,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };

        return await this.dynamo.query(params).promise();
    }

    async get(key: TodoTableKey): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.GetItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: this.tableName,
            Key: {
                todoId: key.todoId,
                userId: key.userId
            }
        }
        return await this.dynamo.get(params).promise();
    }

    async update(key: TodoTableKey, todoUpdate: TodoUpdate): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.tableName,
            Key: {
                todoId: key.todoId,
                userId: key.userId
            },
            ExpressionAttributeNames: {
                '#todo_name': 'name',
            },
            ExpressionAttributeValues: {
                ':done': todoUpdate.done,
                ':dueDate': todoUpdate.dueDate,
                ':name': todoUpdate.name
            },
            UpdateExpression: 'SET #todo_name = :name, done = :done, dueDate = :dueDate',
            ReturnValues: 'ALL_NEW'
        }

        return await this.dynamo.update(params).promise()
    }

    async updateHaveAttachment(key: TodoTableKey): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.tableName,
            Key: {
                todoId: key.todoId,
                userId: key.userId
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': `${key.todoId}`,
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
            ReturnValues: 'ALL_NEW'
        }

        return await this.dynamo.update(params).promise()
    }

    async delete(key: TodoTableKey): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.DeleteItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
            TableName: this.tableName,
            Key: {
                todoId: key.todoId,
                userId: key.userId
            }
        }

        return await this.dynamo.delete(params).promise()
    }
}