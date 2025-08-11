// Mock error utilities (moved to src according to @ alias)
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
