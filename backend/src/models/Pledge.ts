import { Schema, model, Document, Types } from 'mongoose';

export interface IPledge extends Document {
  backer: Types.ObjectId;
  project: Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const pledgeSchema = new Schema<IPledge>(
  {
    backer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Pledge = model<IPledge>('Pledge', pledgeSchema);
