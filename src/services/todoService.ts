import { Todo, ITodo } from '../models/Todo';

export interface CreateTodoInput {
  title: string;
  priority?: string;
  dueDate?: Date | string;
  assignee?: string;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
  priority?: string;
  dueDate?: Date | string | null;
  assignee?: string;
}

export class TodoService {
  /**
   * Create a new todo
   */
  async createTodo(input: CreateTodoInput): Promise<ITodo> {
    const todo = new Todo({
      title: input.title,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      assignee: input.assignee,
    });

    await todo.save();
    return todo;
  }

  /**
   * Get all todos
   */
  async getAllTodos(): Promise<ITodo[]> {
    return await Todo.find().sort({ createdAt: -1 });
  }

  /**
   * Get a single todo by ID
   */
  async getTodoById(id: string): Promise<ITodo | null> {
    return await Todo.findById(id);
  }

  /**
   * Update a todo
   */
  async updateTodo(id: string, input: UpdateTodoInput): Promise<ITodo | null> {
    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.completed !== undefined) updateData.completed = input.completed;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    if (input.assignee !== undefined) updateData.assignee = input.assignee;

    return await Todo.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id: string): Promise<ITodo | null> {
    return await Todo.findByIdAndDelete(id);
  }

  /**
   * Get current datetime information
   */
  getCurrentDateTime() {
    const now = new Date();
    return {
      datetime: now.toISOString(),
      timestamp: now.getTime(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      formatted: now.toLocaleString(),
    };
  }
}

export default new TodoService();
