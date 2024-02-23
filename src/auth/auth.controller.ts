// Importations des modules nécessaires du framework NestJS et des services
import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dto/create-user.dto copy';
import { LogUserDto } from './dto/log-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';

/**
 * Contrôleur d'authentification gérant les routes pour l'authentification des utilisateurs.
 */
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}



    /**
     * Gère la connexion d'un utilisateur.
     * @param {LogUserDto} authBody - Les informations de l'utilisateur pour la connexion.
     * @returns Une promesse résolue avec les détails de la connexion de l'utilisateur.
     */
    @Post('login')
    async login(@Body() authBody: LogUserDto) {
        return this.authService.login({ authBody });
    }



    /**
     * Gère l'enregistrement d'un nouvel utilisateur.
     * @param {CreateUserDto} registerBody - Les informations du nouvel utilisateur.
     * @returns Une promesse résolue avec les détails de l'utilisateur enregistré.
     */
    @Post('register')
    async register(@Body() registerBody: CreateUserDto) {
        return this.authService.register({ registerBody });
    }



    /**
     * Authentifie un utilisateur et renvoie ses informations.
     * Utilise un garde JWT pour s'assurer que l'utilisateur est connecté.
     * @param {RequestWithUser} request - La requête contenant les informations de l'utilisateur connecté.
     * @returns Une promesse résolue avec les informations de l'utilisateur.
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    async authenticateUser(@Request() request: RequestWithUser) {
        return this.userService.getUser(request.user.userId);
    }
}
