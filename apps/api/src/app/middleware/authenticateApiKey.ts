import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { API_KEY_CONSTANTS } from "../modules/apiKey/apiKey.constant";
import { ApiKeyService } from "../modules/apiKey/apiKey.service";
import { Role, UserStatus } from "../constants/index";

export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKeyHeader = req.headers[API_KEY_CONSTANTS.HEADER_NAME];

    if (!apiKeyHeader || typeof apiKeyHeader !== "string") {
      throw new AppError(
        status.UNAUTHORIZED,
        `Unauthorized access! Missing or invalid ${API_KEY_CONSTANTS.HEADER_NAME} header.`
      );
    }

    // Must start with our prefix
    if (!apiKeyHeader.startsWith(API_KEY_CONSTANTS.KEY_PREFIX)) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized access! Invalid API key format."
      );
    }

    const user = await ApiKeyService.validateApiKey(apiKeyHeader);

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid API key.");
    }

    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is not active.");
    }

    if (user.isDeleted) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is deleted.");
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      role: user.role as Role,
      email: user.email,
    };

    next();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    next(error);
  }
};
