import { IsDateString, IsNotEmpty, IsNumber, Max } from "class-validator";

export class OvertimeReqDto {
	@IsDateString()
	@IsNotEmpty()
	date!: string;

	//hours cannot exceed 3
	@IsNotEmpty()
	@IsNumber()
	@Max(3)
	hours!: number;
}