export class AppError extends Error {}

export class ValidationError extends AppError {
  private _errors: string[];
  constructor(errors: string[]) {
    super("Validation Error");
    this._errors = errors;
  }
  get errors() {
    return this._errors;
  }
}

export class AuthError extends AppError {}

export class ForbiddenError extends AppError {}

export class EntityNotFound extends AppError {}

export class DBError extends AppError {}
