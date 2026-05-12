import mongoose, { Schema, Document } from "mongoose";

interface LineItem {
  name: string;
  amount: string;
}

export interface IReceipt extends Document {
  merchant_name: string;
  date: string;
  total_amount: string;
  currency: string;
  items: LineItem[];
  submitted_at: Date;
}

const ReceiptSchema = new Schema<IReceipt>({
  merchant_name: { type: String, default: "" },
  date: { type: String, default: "" },
  total_amount: { type: String, default: "" },
  currency: { type: String, default: "" },
  items: [{ name: { type: String }, amount: { type: String } }],
  submitted_at: { type: Date, default: Date.now },
});

export default mongoose.models.Receipt ||
  mongoose.model<IReceipt>("Receipt", ReceiptSchema);
