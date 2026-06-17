import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'La raison sociale est obligatoire' })
  raisonSociale!: string;

  @IsEmail({}, { message: "Format d'email invalide" })
  email!: string;

  @IsString()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  motDePasse!: string;
}
