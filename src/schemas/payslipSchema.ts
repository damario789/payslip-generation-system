import { IsNotEmpty } from "class-validator";

export class PayslipReqDto {
	@IsNotEmpty()
	payrollPeriodId!: number;
}
