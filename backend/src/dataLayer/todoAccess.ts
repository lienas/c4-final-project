import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
import {TodoItem} from "../models/TodoItem";
import {TodoUpdate} from "../models/TodoUpdate";
import {createLogger} from "../utils/logger";

const logger = createLogger('todoAccess')

/**
 * Enable usage of local Dynamo-DB
 */
function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}

/**
 * Data Logic to access create, delete and update
 * 'todo_items in Dynamo-Database
 */

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODO_TABLE) {
    }

    /**
     * Fetch all todos for a user
     * @param userId = id of the user
     */
    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('get ToDos from database', {'userId': userId})

        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: 'userId=userId',
            ExpressionAttributeNames: {
                "userId": userId
            },
            ExpressionAttributeValues: {}
        }).promise()

        return result.Items as TodoItem[];
    }

    /**
     * create a new todo_item
     * @param item = new todo_item
     */
    async createTodo(item: TodoItem): Promise<TodoItem> {
        logger.info('create ToDos in database', {...item})
        return undefined
    }

    /**
     * update an existing item of a user
     * @param todoId = id of the item to be updated
     * @param todoUpdate = object, with updated data (name, duedate, done)
     */
    async updateTodo(todoId: string, todoUpdate: TodoUpdate): Promise<void> {
        logger.info('update ToDo in database', [{'todoId': todoId}, todoUpdate])
        throw new Error('not yet implemented')
    }

    /**
     * delete a todo_item
     * @param todoId = id of the todo_item
     */
    async deleteTodo(todoId: String): Promise<void> {
        logger.info('delete ToDos in database', {'todoId': todoId})
        await this.docClient.delete(
            {TableName: this.todoTable, Key: todoId}).promise()
    }

    /**
     * generates an upload-url in AWS-S3
     */
    async generateUploadUrl(): Promise<string> {
        logger.info('get UploadUrl from database')
        return undefined
    }


}

