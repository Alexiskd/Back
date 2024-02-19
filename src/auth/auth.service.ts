import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { AuthBody } from './auth.controller';
import {hash,compare} from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


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
        // const hashPassword = await this.hashPassword({password});
    }

    private async hashPassword({password}:{password:string}) {
        const hashedPassword = await hash(password,10);
        return hashedPassword;
    }

    private async isPasswordValid({password,hashedPassword}:{password:string,hashedPassword:string}) {
        const isPasswordValid = await compare(password,hashedPassword);
        return isPasswordValid;
    }

    private async authenticateUser({userId}:{userId:string}) {
        const payload = {userId};
            return {
            access_token: this.jwtService.sign(payload),
            };
    }
}
