import mongoose, { Document, Schema } from 'mongoose';

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ITodo extends Document {
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignee: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Todo = mongoose.model<ITodo>('Todo', TodoSchema);
