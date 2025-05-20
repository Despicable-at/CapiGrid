import { Schema, model, Document, Types } from 'mongoose';

export enum ProjectStatus {
  Active = 'active',
  Completed = 'completed',
  Canceled = 'canceled',
}

export const Categories = [
  'Art & Design',
  'Technology',
  'Games',
  'Social Causes',
] as const;
export type Category = typeof Categories[number];

export interface IProject extends Document {
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  creator: Types.ObjectId;
  deadline: Date;
  status: ProjectStatus;
  category: Category;
  isFeatured: boolean;
  createdAt: Date;
}

// Create text index for search
const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, required: true, default: 0 },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.Active,
    },
    category: {
      type: String,
      enum: Categories,
      required: true,
    },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text search index
projectSchema.index({ title: 'text', description: 'text' });

// Virtual: percentFunded
projectSchema.virtual('percentFunded').get(function (this: IProject) {
  return Math.min(100, Math.round((this.currentAmount / this.goalAmount) * 100));
});

export const Project = model<IProject>('Project', projectSchema);
