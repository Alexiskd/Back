import { Controller, Get, Param, Patch, Body, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as multer from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    /**
     * Récupère la liste de tous les utilisateurs.
     * Cette route est sécurisée avec JwtAuthGuard, nécessitant une authentification JWT valide.
     * @returns Une promesse résolue avec la liste des utilisateurs.
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    getUsers() {
        return this.userService.getUsers();
    }

    /**
     * Récupère les informations d'un utilisateur spécifique par son ID.
     * @param {string} userId - L'ID de l'utilisateur à récupérer.
     * @returns Une promesse résolue avec les informations de l'utilisateur demandé.
     */
    @Get('/:userId')
    getUser(@Param('userId') userId: string) {
        return this.userService.getUser(userId);
    }

    /**
     * Met à jour la description d'un utilisateur spécifié par son ID.
     * Nécessite une authentification JWT.
     * @param {string} userId - L'ID de l'utilisateur à mettre à jour.
     * @param {string} newDescription - La nouvelle description de l'utilisateur.
     * @returns Une promesse résolue avec les informations de l'utilisateur mis à jour.
     */
    @UseGuards(JwtAuthGuard)
    @Patch('/:userId/description')
    updateDescription(@Param('userId') userId: string, @Body('description') newDescription: string) {
        return this.userService.updateDescription(userId, newDescription);
    }

    /**
     * Met à jour l'email d'un utilisateur spécifié par son ID.
     * Nécessite une authentification JWT.
     * @param {string} userId - L'ID de l'utilisateur à mettre à jour.
     * @param {string} newEmail - Le nouvel email de l'utilisateur.
     * @returns Une promesse résolue avec les informations de l'utilisateur mis à jour.
     */
    @UseGuards(JwtAuthGuard)
    @Patch('/:userId/email')
    updateEmail(@Param('userId') userId: string, @Body('email') newEmail: string) {
        return this.userService.updateEmail(userId, newEmail);
    }

    /**
     * Met à jour le mot de passe d'un utilisateur spécifié par son ID.
     * Nécessite une authentification JWT.
     * @param {string} userId - L'ID de l'utilisateur à mettre à jour.
     * @param {string} newPassword - Le nouveau mot de passe de l'utilisateur.
     * @returns Une promesse résolue avec les informations de l'utilisateur mis à jour.
     */
    @UseGuards(JwtAuthGuard) 
    @Patch('/:userId/password')
    updatePassword(@Param('userId') userId: string, @Body('password') newPassword: string) {
        return this.userService.updatePassword(userId, newPassword);
    }

    /**
     * Met à jour l'image de profil d'un utilisateur spécifié par son ID, en utilisant multer pour le traitement du fichier.
     * Nécessite une authentification JWT.
     * @param {Express.Multer.File} file - Le fichier de l'image de profil à uploader.
     * @param {string} userId - L'ID de l'utilisateur dont l'image de profil doit être mise à jour.
     * @returns Une promesse résolue avec les informations de l'utilisateur mis à jour.
     */
    @UseGuards(JwtAuthGuard)
    @Post('/:userId/profile-picture')
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: './uploads/profile-pictures',
            filename: (req, file, callback) => {
                const fileName: string = path.parse(file.originalname).name.replace(/\s+/g, '') + uuidv4();
                const extension: string = path.parse(file.originalname).ext;
                callback(null, `${fileName}${extension}`);
            },
        }),
    }))
    updateProfilePicture(@UploadedFile() file: Express.Multer.File, @Param('userId') userId: string) {
        return this.userService.updateProfilePicture(userId, file);
    }
}
