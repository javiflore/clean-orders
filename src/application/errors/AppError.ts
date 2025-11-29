export abstract class AppError extends Error {
  abstract readonly type: 'ValidationError' | 'NotFoundError' | 'ConflictError' | 'InfraError' | 'AppError';
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  readonly type = 'ValidationError' as const;
  constructor(public readonly details?: any, message?: string) {
    super(message ?? 'Validation error');
  }
}

export class NotFoundError extends AppError {
  readonly type = 'NotFoundError' as const;
  constructor(message?: string) {
    super(message ?? 'Not found');
  }
}

export class ConflictError extends AppError {
  readonly type = 'ConflictError' as const;
  constructor(message?: string) {
    super(message ?? 'Conflict');
  }
}

export class InfraError extends AppError {
  readonly type = 'InfraError' as const;
  constructor(message?: string) {
    super(message ?? 'Infrastructure error');
  }
}
