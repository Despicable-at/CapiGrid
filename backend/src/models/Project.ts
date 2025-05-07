import { Schema, model, Document, Types } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  creator: Types.ObjectId;
  createdAt: Date;
  deadline: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, required: true, default: 0 },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Project = model<IProject>('Project', projectSchema);
