import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getUsers(){
        return this.userService.getUsers();
    }

    @Get('/:userId')
    getUser(@Param('userId') userId: string){
        return this.userService.getUser({ userId });
    }

    @Patch('/:userId/description')
    updateDescription(@Param('userId') userId: string, @Body('description') newDescription: string) {
        return this.userService.updateDescription(userId, newDescription);
    }

    @Patch('/:userId/email')
    updateEmail(@Param('userId') userId: string, @Body('email') newEmail: string) {
        return this.userService.updateEmail(userId, newEmail);
    }
}
