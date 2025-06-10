import { IsDateString, IsNotEmpty } from "class-validator";

export class AttendanceReqDto {
	@IsDateString()
	@IsNotEmpty()
	date!: string;
}