import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ReimbursementReqDto {
	@IsString()
	@IsNotEmpty()
	description!: string;

	@IsNumber()
	@IsNotEmpty()
	amount!: number;
}
