import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'
import {getTodos} from "../../businessLayer/todo";
import {createLogger} from "../../utils/logger";

const logger = createLogger('GetTodos-API')

export const handler: APIGatewayProxyHandler =
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        // TODO: Get all TODO items for a current user
        const authorization = event.headers.Authorization
        const jwtToken = authorization.split(' ')[1]

        logger.info('API Called with JWT-Token = ' + jwtToken)

        const todos = await getTodos(jwtToken)

        logger.info('received todos from database', {'todos': todos})

        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                todos
            })
        }

    }
