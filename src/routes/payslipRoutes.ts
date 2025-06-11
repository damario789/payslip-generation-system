// Payslip Module: Generates and manages payslips

import { Router } from "express";
import express from "express";
import { generatePayslipController } from "../controllers/payslipController";
import { isEmployee } from "../middleware/authMiddleware";

const router = Router();

// POST /payslips - Generate a new payslip (employee only)
router.post("/", isEmployee as express.RequestHandler, generatePayslipController);

export default router;
