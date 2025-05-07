import { Schema, model, Document, Types } from 'mongoose';

export enum ProjectStatus {
  Active = 'active',
  Completed = 'completed',
  Canceled = 'canceled',
}

export interface IProject extends Document {
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  creator: Types.ObjectId;
  deadline: Date;
  status: ProjectStatus;
  createdAt: Date;
}



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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: percentFunded
projectSchema.virtual('percentFunded').get(function (this: IProject) {
  return Math.min(100, Math.round((this.currentAmount / this.goalAmount) * 100));
});

export const Project = model<IProject>('Project', projectSchema);
