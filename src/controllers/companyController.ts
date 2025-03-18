import { Request, Response } from "express";
import generateExpiryDate from "../utils/apiExpiry";
import Company, { Service } from "../schema/companySchema";


// Create Company
export const createCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, services } = req.body;

    if (!name || !Array.isArray(services) || services.length === 0) {
      res
        .status(400)
        .json({ message: "Invalid input: name and services are required." });
      return;
    }

    // Validate services
    const validServices = Object.values(Service);
    console.log(validServices);
    
    if (
      !services.every((service: Service) => validServices.includes(service))
    ) {
      res.status(400).json({ message: "Invalid services provided." });
      return;
    }


    const company = new Company({
      name,
      services,
      apiKey: generatedKey,
      expiryDate: generateExpiryDate.oneMonth(),
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Company
export const extendApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apiKey = req.headers.authorization;

    if (!apiKey) {
      res.status(400).json({ message: "API key is required for updating." });
      return;
    }

    const company = await Company.findOneAndUpdate(
      { apiKey },
      { 
        expiryDate: generateExpiryDate.oneMonth(),
      },
      {
        new: true,
      }
    );

    if (!company) {
      res.status(404).json({ message: "Company not found." });
      return;
    }

    res.status(200).send({
      message: `API key Extended successfully till : ${company.expiryDate} `,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

