import { IsEmail, IsNotEmpty,IsString ,MinLength,MaxLength} from 'class-validator';

export class CreateUserDto {
  @IsEmail({},{
    message:'Vous devez fournir une adresse email valide.'
  })
  email: string;

  @IsNotEmpty()
  @MinLength(5,{
    message:'Votre mot de passe doit comporter plus de 5 caractères.'
  })
  password: string;

  @IsString({
    message:'Vous devez fournir un prénom.'
  })
  firstName:string;

  lastName?: string; 
  profilePicture?: string;
  description?:string;
}