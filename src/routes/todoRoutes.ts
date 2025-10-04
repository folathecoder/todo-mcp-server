import { Router, Request, Response } from 'express';
import { Todo } from '../models/Todo';

const router = Router();

// Create a new todo
router.post('/todos', async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = new Todo({ title });
    await todo.save();

    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Get all todos
router.get('/todos', async (req: Request, res: Response) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    return res.status(200).json(todos);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Get a single todo by ID
router.get('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// Update a todo
router.put('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const todo = await Todo.findByIdAndUpdate(
      id,
      { title, completed },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo
router.delete('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    return res.status(200).json({ message: 'Todo deleted successfully', todo });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
