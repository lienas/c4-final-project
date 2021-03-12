import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {TodoItem} from "../models/TodoItem";
import {TodoUpdate} from "../models/TodoUpdate";
import {createLogger} from "../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todoAccess')
const bucket = process.env.BUCKET_NAME
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

/**
 * Enable usage of local Dynamo-DB
 */
function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}

function createS3Client() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating local S3 instance')
        return new XAWS.S3({
            s3ForcePathStyle: true,
            accessKeyId: 'S3RVER', // This specific key is required when working offline
            secretAccessKey: 'S3RVER',
            endpoint: new AWS.Endpoint('http://localhost:4569'),
        })
    }

    return new XAWS.S3({signatureVersion: 'v4'})
}

/**
 * Data Logic to access create, delete and update
 * 'todo_items in Dynamo-Database
 */

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private  readonly s3Client = createS3Client(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.INDEX_NAME) {
    }

    /**
     * Fetch all todos for a user
     * @param userId = id of the user
     */
    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('get ToDos from database', {'userId': userId, 'table': this.todoTable})

        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.indexName,
            KeyConditionExpression: 'userId= :userId',
            ExpressionAttributeValues: {':userId': userId}
        }).promise()

        return result.Items as TodoItem[];
    }

    /**
     * create a new todo_item
     * @param item = new todo_item
     */
    async createTodo(item: TodoItem): Promise<TodoItem> {
        logger.info('create ToDos in database', {...item, 'Table': this.todoTable})
        const params = {
            TableName: this.todoTable,
            Item: {
                ...item
            }
        }
        const result = await this.docClient.put(params).promise()
        logger.info('Response from put', {'response': result.$response.data, 'error': result.$response.error})
        return item
    }

    /**
     * update an existing item of a user
     * @param todoId = id of the item to be updated
     * @param todoUpdate = object, with updated data (name, duedate, done)
     * @param userId = id of user, who owns the item
     */
    async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoItem> {
        logger.info('update ToDo in database',
            {'todoId': todoId, 'userId': userId, 'todoUpdate': todoUpdate})

        const item = await this.docClient.update(
            {
                TableName: this.todoTable,
                Key: {
                    'todoId': todoId,
                    'userId': userId
                },
                UpdateExpression: "set #name = :n, #dueDate=:dd, #done=:d",
                ExpressionAttributeValues: {
                    ":n": todoUpdate.name,
                    ":dd": todoUpdate.dueDate,
                    ":d": todoUpdate.done
                },
                ExpressionAttributeNames: {
                    '#name': 'name',
                    '#dueDate': 'dueDate',
                    '#done': 'done'
                },
                ReturnValues: "UPDATED_NEW"
            }
        ).promise()

        return item.$response.data as TodoItem
    }

    /**
     * delete a todo_item
     * @param todoId = id of the todo_item
     */
    async deleteTodo(todoId: String, userId: string): Promise<void> {
        logger.info('delete ToDos in database', {'todoId': todoId, 'userId': userId})
        await this.docClient.delete(
            {
                TableName: this.todoTable,
                Key: {
                    'todoId': todoId,
                    'userId': userId
                }
            }).promise()
    }

    /**
     * generates an upload-url in AWS-S3
     */
    async generateUploadUrl(todoId: string): Promise<string> {

        logger.info('get UploadUrl from database', {'bucket': bucket, 'todoId': todoId, 'expires': urlExpiration})

        return this.s3Client.getSignedUrl('putObject', {
            Bucket: bucket,
            Key: todoId,
            Expires: urlExpiration
        })
    }
}
