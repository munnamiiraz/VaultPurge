import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRenponce";
import { ApiKeyService } from "./apiKey.service";
import { createApiKeySchema } from "./apiKey.validation";

// ─── POST /api-keys ──────────────────────────────────────────────────────────

const createApiKey = catchAsync(async (req, res) => {
  const parsed = createApiKeySchema.safeParse(req.body);

  if (!parsed.success) {
    sendResponse(res, {
      httpStatusCode: status.BAD_REQUEST,
      success: false,
      message: "Validation failed",
      data: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const result = await ApiKeyService.createApiKey(
    req.user.userId,
    parsed.data.name
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "API key created successfully. Please save it now as it will not be shown again.",
    data: result,
  });
});

// ─── GET /api-keys ───────────────────────────────────────────────────────────

const listApiKeys = catchAsync(async (req, res) => {
  const keys = await ApiKeyService.listApiKeys(req.user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "API keys retrieved successfully",
    data: keys,
  });
});

// ─── DELETE /api-keys/:id ────────────────────────────────────────────────────

const revokeApiKey = catchAsync(async (req, res) => {
  const { id } = req.params;

  await ApiKeyService.revokeApiKey(id as string, req.user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "API key revoked successfully",
  });
});

export const ApiKeyController = {
  createApiKey,
  listApiKeys,
  revokeApiKey,
};
