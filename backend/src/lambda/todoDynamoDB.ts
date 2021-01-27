import {TodoItem} from "../models/TodoItem";
import {PromiseResult} from "aws-sdk/lib/request";
import * as AWS from "aws-sdk";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";


export interface TodoRepository {
    create(newItem: TodoItem): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>;

    queryByUser(userId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.QueryOutput, AWS.AWSError>>;

    queryByTodo(todoId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.QueryOutput, AWS.AWSError>>

    update(todoId: string, updatedTodo: UpdateTodoRequest): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>

    updateHaveAttachment(todoId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>

    delete(todoId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.DeleteItemOutput, AWS.AWSError>>
}

export class TodoDynamoDB implements TodoRepository {
    constructor(private readonly dynamo: AWS.DynamoDB.DocumentClient,
                private readonly tableName: string) {
    }

    async create(newItem: TodoItem): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.tableName,
            Key: {
                todoId: newItem.todoId
            },
            ExpressionAttributeNames: {
                '#todo_name': 'name',
            },
            ExpressionAttributeValues: {
                ':done': newItem.done,
                ':dueDate': newItem.dueDate,
                ':name': newItem.name,
                ':createdAt': newItem.createdAt,
                ':userId': newItem.userId,
            },
            UpdateExpression: 'SET #todo_name = :name, done = :done, dueDate = :dueDate, createdAt = :createdAt, userId = :userId',
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

    async queryByTodo(todoId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.QueryOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: this.tableName,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        }

        return await this.dynamo.query(params).promise();
    }

    async update(todoId: string, updatedTodo: UpdateTodoRequest): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.tableName,
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

        return await this.dynamo.update(params).promise()
    }

    async updateHaveAttachment(todoId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.tableName,
            Key: {
                todoId: todoId
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': `${todoId}`,
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
            ReturnValues: 'ALL_NEW'
        }

        return await this.dynamo.update(params).promise()
    }

    async delete(todoId: string): Promise<PromiseResult<AWS.DynamoDB.DocumentClient.DeleteItemOutput, AWS.AWSError>> {
        const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
            TableName: this.tableName,
            Key: {
                todoId: todoId
            }
        }

        return await this.dynamo.delete(params).promise()
    }
}