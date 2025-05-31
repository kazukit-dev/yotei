export class ApiError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class AuthError extends ApiError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export const handleApiError = (status: number): never => {
  switch (status) {
    case 401:
      throw new AuthError("Unauthorized access");
    default:
      throw new ApiError("An unexpected error occurred");
  }
};
