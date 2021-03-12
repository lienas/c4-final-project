import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import {getUploadUrl} from "../../businessLayer/todo";


const logger = createLogger('GetUploadUrl-API')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    logger.info('get upload url for ' + todoId)

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const url = await getUploadUrl(todoId)

    logger.info('received upload url ' + url)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            url
        })
    }
}
