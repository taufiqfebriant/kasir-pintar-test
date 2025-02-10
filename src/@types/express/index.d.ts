declare namespace Express {
  interface Request {
    auth?: {
      id: number;
      email: string;
    };
  }
}
