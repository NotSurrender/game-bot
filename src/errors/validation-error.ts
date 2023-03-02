export class ValidationError extends Error {
  context?: string;

  constructor(message: string, context?: string) {
    super(message);
    this.context = context;
  }
}
