import 'source-map-support/register'
import * as AWSXRay from "aws-xray-sdk";
import * as AWS from "aws-sdk";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {TodoDynamoDB} from "../todoDynamoDB";
import {TodoAttachmentS3} from "../todoAttachmentBucket";
import {deleteTodo} from "./deleteTodo";
import {getUserId} from "../utils";

const XAWS = AWSXRay.captureAWS(AWS)
const todoRepository = new TodoDynamoDB(
    new XAWS.DynamoDB.DocumentClient(),
    process.env.TODOS_DYNAMODB_TABLE)
const attachmentBucket = new TodoAttachmentS3(
    new XAWS.S3({signatureVersion: 'v4'}),
    process.env.TODOS_ATTACHMENT_BUCKET)

const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    try {
        await deleteTodo(todoId, userId, todoRepository, attachmentBucket, log)

        return {
            statusCode: 204,
            body: JSON.stringify({}),
        }
    } catch (error) {
        const message = `Failed to delete todo: ${error}`
        log.error(message)
        return {
            statusCode: 400,
            body: JSON.stringify({error: message})
        }
    }
}).use(cors(
    {credentials: true}
    )
)
