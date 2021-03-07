import * as uuid from 'uuid'
import {TodoItem} from "../models/TodoItem";
import {createLogger} from "../utils/logger";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {parseUserId} from "../auth/utils";
import {TodoAccess} from "../dataLayer/todoAccess";

const logger = createLogger('todo-business-layer')
const todoAccess = new TodoAccess()

export async function getTodos(token: string) : Promise<TodoItem[]>{

    const userId = parseUserId(token)
    logger.info('getTodos for ' + userId)
    return await todoAccess.getTodos(userId)
}

export async function createTodo(
    request: CreateTodoRequest,
    token: string):Promise<TodoItem> {

    const itemId = uuid.v4()
    const userId = parseUserId(token)

    return await todoAccess.createTodo(
        {
            userId: userId,
            todoId: itemId,
            createdAt: new Date().toISOString(),
            name: request.name,
            dueDate: request.dueDate,
            done: false,
            attachmentUrl: ''
        }
    )

}
