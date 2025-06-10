import { IsNotEmpty } from "class-validator";

export class LoginReqDto {
	@IsNotEmpty()
	username!: string;

	@IsNotEmpty()
	password!: string;
}