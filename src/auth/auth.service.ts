import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { AuthBody, CreateUser } from './auth.controller';
import {hash,compare} from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Userpayload } from './jwt.strategy';


@Injectable()
export class AuthService {
    constructor(private readonly prisma:PrismaService,private readonly jwtService: JwtService) {}
    

    async login({authBody}:{authBody:AuthBody}){
        const {email,password} = authBody;
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: authBody.email
            }
        });
        if (!existingUser) {
            throw new Error("L'utilisateur n'existe pas.")
        } 
         


        const isPasswordValid = await this.isPasswordValid({password,hashedPassword:existingUser.password,});
        if (!isPasswordValid){
            throw Error("Le mot de passe est invalide.");
        };
        return this.authenticateUser({userId:existingUser.id});
        // 
    }

    private async hashPassword({password}:{password:string}) {
        const hashedPassword = await hash(password,10);
        return hashedPassword;
    }
    
    async register({registerBody}:{registerBody: CreateUser}){
        const {email,firstName,password} = registerBody;
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: registerBody.email
            }
        });
        if (existingUser) {
            throw new Error("Un compte existe déja !")
        } 
         

        const hashedPassword = await this.hashPassword({password})
        const createdUser = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
            },
        });
       
        return this.authenticateUser({userId:createdUser.id});
        
    }




    private async isPasswordValid({password,hashedPassword}:{password:string,hashedPassword:string}) {
        const isPasswordValid = await compare(password,hashedPassword);
        return isPasswordValid;
    }

    private async authenticateUser({userId}: Userpayload) {
        const payload : Userpayload = {userId};
            return {
            access_token: this.jwtService.sign(payload),
            };
    }
}
