import { Body,Controller ,Get,Post, UseGuards, Request} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';

export type AuthBody = {email:string;password:string}
export type CreateUser = {email:string;firstName:string;password:string}


@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService,private readonly UserService : UserService){}

    @Post('login')
    async login(@Body() authBody: AuthBody) {
        console.log({authBody});
        return await this.authService.login({authBody});
    }

    @Post('register')
    async register(@Body() registerBody: CreateUser) {
        return await this.authService.register({registerBody});
    }
    
    @UseGuards(JwtAuthGuard)
    @Get()
    async authenticateUser(@Request() request: RequestWithUser) {
        return await this.UserService.getUser({userId: request.user.userId}); 
    }
}


