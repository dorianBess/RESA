import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: "Format d'email invalide" })
  email!: string;

  @IsString()
  @MinLength(6)
  motDePasse!: string;
}
