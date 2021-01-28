import 'source-map-support/register'
import * as AWSXRay from "aws-xray-sdk";
import * as AWS from "aws-sdk";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import {createLogger} from "../../utils/logger";
import {updateTodo} from "./updateTodo";
import {TodoDynamoDB} from "../todoDynamoDB";
import {getUserId} from "../utils";

const XAWS = AWSXRay.captureAWS(AWS)
const todoRepository = new TodoDynamoDB(
    new XAWS.DynamoDB.DocumentClient(),
    process.env.TODOS_DYNAMODB_TABLE,)
const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const toUpdate: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    try {
        await updateTodo(todoId, userId, toUpdate, todoRepository, log)

        return {
            statusCode: 204,
            body: JSON.stringify({})
        }
    } catch (error) {
        const message = `Failed to update todo: ${error}`
        log.error(message)
        return {
            statusCode: 400,
            body: JSON.stringify({error: message})
        }
    }
}).use(cors(
    { credentials: true }
    )
)
