import { Request, RequestHandler, Response } from 'express';
import { loginEmployee, loginAdmin } from '../services/authService';
import { validator } from '../utils/validatorUtil';
import { LoginReqDto } from '../schemas/authSchema';

export const employeeLogin: RequestHandler = async (req: Request, res: Response): Promise<void> => {
   try {
      const validated = await validator(LoginReqDto, req.body)
      const token = await loginEmployee(validated.username, validated.password, req);
      res.json({ token });
   } catch (error) {
      throw error;
   }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
   try {
      const validated = await validator(LoginReqDto, req.body)
      const token = await loginAdmin(validated.username, validated.password, req);
      res.json({ token });
   } catch (error) {
      throw error;
   }
};
