import { Body,Controller ,Get,Post, UseGuards, Request} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto copy';
import { LogUserDto } from './dto/log-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';




@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService,private readonly UserService : UserService){}

    @Post('login')
    async login(@Body() authBody: LogUserDto) {
        console.log({authBody});
        return await this.authService.login({authBody});
    }

    @Post('register')
    async register(@Body() registerBody: CreateUserDto) {
        return await this.authService.register({registerBody});
    }
    
    @UseGuards(JwtAuthGuard)
    @Get()
    async authenticateUser(@Request() request: RequestWithUser) {
        return await this.UserService.getUser({userId: request.user.userId}); 
    }
    
}


