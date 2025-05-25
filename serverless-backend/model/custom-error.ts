export class CustomError extends Error {

    private constructor(readonly code: number, message: string) {
      super(message);
    }
  
    static internal(message: string) {
      return new CustomError(500, message);
    }
  
    static invalid(message: string) {
      return new CustomError(400, message);
    }
  
    static notFound(message: string) {
      return new CustomError(404, message);
    }
  
    static conflict(message: string) {
      return new CustomError(409, message);
    }
  
    static unauthenticated(message: string) {
      return new CustomError(401, message);
    }
  
    static unauthorized(message: string) {
      return new CustomError(403, message);
    }
  
    static authenticated(message: string) {
      return new CustomError(403, message);
    }
  }