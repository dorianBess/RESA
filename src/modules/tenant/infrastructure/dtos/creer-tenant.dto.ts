import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreerTenantDto {
  @IsString({ message: 'La raison sociale est obligatoire' })
  raisonSociale!: string;

  @IsEmail({}, { message: 'Le champ email est obligatoire' })
  email!: string;

  @IsString()
  @MinLength(6)
  motDePasse!: string;
}
