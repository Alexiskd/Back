import { IsEmail, IsNotEmpty,IsString ,MinLength,MaxLength} from 'class-validator';

export class LogUserDto {
  @IsEmail({},{
    message:'Vous devez fournir une adresse email valide.'
  })
  email: string;

  @IsNotEmpty()
  @MinLength(5,{
    message:'Votre mot de passe doit comporter plus de 8 caractères.'
  })
  password: string;
  lastName?: string; 
  profilePicture?: string;
  description?:string;
}