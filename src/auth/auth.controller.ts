import { Body,Controller ,Get,Post} from '@nestjs/common';
import { AuthService } from './auth.service';


export type AuthBody = {email:string;password:string}
@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @Post('login')
    async login(@Body() authBody: AuthBody) {
        console.log({authBody});
        return await this.authService.login({authBody});
    }

    @Get()
    async authenticate() {
        return; 
    }
}
