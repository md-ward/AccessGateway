import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
// Enum for allowed services
export enum Service {
  CHATTING = "chatting",
  ATTACHMENTS = "attachments",
  DRIVE = "drive",
  STOCK = "stock",
  
}

// Define the interface for TypeScript
interface ICompany extends Document { 
  name: string;
  services: Service[];
  apiKey: string;
  expiryDate?: Date;
  validateApiKey(candidateKey: string): Promise<boolean>;
}

// Define the Mongoose Schema
const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  services: {
    type: [String], // Store services as an array of strings
    enum: Object.values(Service), // Enforce enum values
    required: true,
  },
  apiKey: { type: String, required: true, unique: true }, // Unique API key
  expiryDate: { type: Date }, // Optional expiry
});

// Hash API key before saving
CompanySchema.pre("save", async function (next) {
  if (this.isModified("apiKey")) {
    const salt = await bcrypt.genSalt(10);
    this.apiKey = await bcrypt.hash(this.apiKey, salt);
  }
  next();
});

// Method to validate API key
CompanySchema.methods.validateApiKey = async function (candidateKey: string) {
  return await bcrypt.compare(candidateKey, this.apiKey);
};

// Create the Mongoose model
const Company = mongoose.model<ICompany>("Company", CompanySchema);
export default Company;
