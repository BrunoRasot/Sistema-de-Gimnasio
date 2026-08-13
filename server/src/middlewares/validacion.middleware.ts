import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validarSchema =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          mensaje: error.issues.map((e: any) => e.message).join(', '),
        });
      }
      return res.status(400).json({ mensaje: 'Error de validación de datos.' });
    }
  };
