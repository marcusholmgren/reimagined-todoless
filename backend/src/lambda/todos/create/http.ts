import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from "aws-xray-sdk";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {CreateTodoRequest} from '../../../requests/CreateTodoRequest'
import {createLogger} from "../../../utils/logger";
import {getUserId} from "../../utils";
import {createTodo} from './createTodo'
import {TodoDynamoDB} from "../../todoDynamoDB";

const XAWS = AWSXRay.captureAWS(AWS)
const dynamoDB = new TodoDynamoDB(
    new XAWS.DynamoDB.DocumentClient(),
    process.env.TODOS_DYNAMODB_TABLE,)

const log = createLogger('todoless')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    try {
        const results = await createTodo(userId, newTodo, dynamoDB)

        return {
            statusCode: 201,
            body: JSON.stringify({item: results.Attributes}),
        }
    } catch (error) {
        const message = `Failed to store TODO item. ${error}`
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