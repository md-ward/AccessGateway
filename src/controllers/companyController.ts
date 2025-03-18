import { Request, Response } from "express";
import generateExpiryDate from "../utils/apiExpiry";
import Company, { Service } from "../schema/companySchema";
import { Role, User } from "../schema/userSchema";
import { ExpiryOption, generateToken } from "../utils/generateTokens";

// Create Company
export const createCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, companyName, services, email, password } = req.body;

    if (!name || !Array.isArray(services) || services.length === 0) {
      res
        .status(400)
        .json({ message: "Invalid input: name and services are required." });
      return;
    }

    // Validate services
    const validServices = Object.values(Service);

    if (
      !services.every((service: Service) => validServices.includes(service))
    ) {
      res.status(400).json({ message: "Invalid services provided." });
      return;
    }

    const company = new Company({
      name: companyName,
      services,
      expiryDate: generateExpiryDate.oneMonth(),
    });

    const user = new User({
      role: Role.ADMIN,
      name,
      email,
      password,
      services,
      comp: [company._id],
    });
    await Promise.all([company.save(), user.save()]);

    const token = await generateToken(
      { id: user._id, role: user.role, company: user.comp },
      "OWNER",
      ExpiryOption.oneMonth
    );
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({ message: "Company created successfully." });
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

    // should check payment then update api expiry
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
