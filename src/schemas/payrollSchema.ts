import { IsDateString, IsNotEmpty } from "class-validator";

export class PayrollPeriodReqDto {
	@IsDateString()
	@IsNotEmpty()
	startDate!: string;

	@IsDateString()
	@IsNotEmpty()
	endDate!: string;
}

export class RunPayrollReqDto {
	@IsNotEmpty()
	payrollPeriodId!: number;
}
