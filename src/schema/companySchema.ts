import mongoose, { Schema, Document } from "mongoose";
// Enum for allowed services
export enum Service {
  CHATTING = "chatting",
  ATTACHMENTS = "attachments",
  DRIVE = "drive",
  STOCK = "stock",
  ALL = "all"
}

// Define the interface for TypeScript
interface ICompany extends Document {
  name: string;
  services: Service[];
  expiryDate?: Date;
}

// Define the Mongoose Schema
const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true, unique: true },
  services: {
    type: [String], // Store services as an array of strings
    enum: Object.values(Service), // Enforce enum values
    required: true,
  },
});

// Create the Mongoose model
const Company = mongoose.model<ICompany>("Company", CompanySchema);
export default Company;
