// Payroll Module: Admin-only payroll operations

import { Router } from "express";
import express from "express";
import { createPayrollPeriodController, runPayrollController, payrollSummaryController } from "../controllers/payrollController";
import { isAdmin } from "../middleware/authMiddleware";

const router = Router();

// POST /payroll/period - Create a new payroll period (admin only)
router.post("/period", isAdmin as express.RequestHandler, createPayrollPeriodController);

// POST /payroll/run - Run payroll for a period (admin only)
router.post("/run", isAdmin as express.RequestHandler, runPayrollController);

// GET /payroll/summary - Get payroll summary (admin only)
router.get("/summary", isAdmin as express.RequestHandler, payrollSummaryController);

export default router;
