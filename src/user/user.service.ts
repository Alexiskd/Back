import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'prisma.service';
import { extname } from 'path';
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlink } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}


    
    /* Méthodes publiques pour la gestion des utilisateurs */

    /**
     * Récupère la liste complète des utilisateurs en sélectionnant certains champs.
     * @returns Un tableau d'utilisateurs avec des champs spécifiques.
     */
    async getUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                description: true,
            },
        });
    }

    /**
     * Récupère les détails d'un utilisateur spécifique par son ID.
     * @param userId L'identifiant unique de l'utilisateur à récupérer.
     * @returns Les détails de l'utilisateur spécifié ou null si non trouvé.
     */
    async getUser(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                description: true,
            },
        });
    }



    /* Méthodes pour la mise à jour du profil de l'utilisateur */

    /**
     * Met à jour la description d'un utilisateur spécifique.
     * @param userId L'ID de l'utilisateur à mettre à jour.
     * @param newDescription La nouvelle description de l'utilisateur.
     * @returns Les détails de l'utilisateur mis à jour.
     */
    async updateDescription(userId: string, newDescription: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { description: newDescription },
        });
    }

    /**
     * Valide le format de l'email et met à jour l'email d'un utilisateur.
     * @param userId L'ID de l'utilisateur dont l'email doit être mis à jour.
     * @param newEmail Le nouvel email de l'utilisateur.
     * @throws HttpException si l'email est invalide.
     * @returns Les détails de l'utilisateur mis à jour.
     */
    async updateEmail(userId: string, newEmail: string) {
        if (!this.isValidEmail(newEmail)) {
            throw new HttpException('Adresse e-mail invalide', HttpStatus.BAD_REQUEST);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { email: newEmail },
        });
    }

    /**
     * Valide et met à jour le mot de passe d'un utilisateur après l'avoir haché.
     * @param userId L'ID de l'utilisateur dont le mot de passe doit être mis à jour.
     * @param newPassword Le nouveau mot de passe de l'utilisateur.
     * @throws HttpException si le mot de passe est considéré comme trop court.
     * @returns Les détails de l'utilisateur mis à jour.
     */
    async updatePassword(userId: string, newPassword: string) {
        if (newPassword.length <= 5) {
            throw new HttpException('Mot de passe invalide', HttpStatus.BAD_REQUEST);
        }
        const hashedPassword = await this.hashPassword(newPassword);
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    /**
     * Met à jour la photo de profil d'un utilisateur en gérant l'upload de fichier.
     * @param userId L'ID de l'utilisateur dont la photo de profil doit être mise à jour.
     * @param file Le fichier de la nouvelle photo de profil.
     * @throws HttpException si l'utilisateur n'est pas trouvé ou si le fichier est invalide.
     * @returns Les détails de l'utilisateur mis à jour.
     */
    async updateProfilePicture(userId: string, file: Express.Multer.File) {
        const user = await this.getUser(userId);
        if (!user) {
            throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
        }
        this.validateFile(file);
        const newFilePath = await this.handleFileUpload(file);
        if (user.profilePicture) {
            await this.deleteFile(user.profilePicture);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { profilePicture: newFilePath },
        });
    }



    /* Méthodes privées pour soutenir les opérations principales */

    /**
     * Hache le mot de passe en utilisant bcrypt.
     * @param password Le mot de passe en clair à hacher.
     * @returns Le mot de passe haché.
     */
    private async hashPassword(password: string): Promise<string> {
        return hash(password, 10);
    }

    /**
     * Vérifie si l'email fourni est valide.
     * @param email L'email à valider.
     * @returns True si l'email est valide, sinon false.
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valide le fichier en vérifiant son type MIME et sa taille.
     * @param file Le fichier à valider.
     * @throws HttpException si le fichier n'est pas valide.
     */
    private validateFile(file: Express.Multer.File) {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new HttpException('Type de fichier non autorisé', HttpStatus.BAD_REQUEST);
        }
        const maxSizeInBytes = 5 * 1024 * 1024; // 5 Mo
        if (file.size > maxSizeInBytes) {
            throw new HttpException('Taille de fichier dépassée', HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Gère l'upload du fichier en générant un nom unique pour le stockage.
     * @param file Le fichier à uploader.
     * @returns Le chemin du fichier sauvegardé.
     */
    private async handleFileUpload(file: Express.Multer.File): Promise<string> {
        const fileExt = extname(file.originalname);
        let fileName = `${uuidv4()}${fileExt}`;
        const uploadDir = 'uploads/profile-pictures';
        while (existsSync(`${uploadDir}/${fileName}`)) {
            fileName = `${uuidv4()}${fileExt}`;
        }
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }
        const newFilePath = `${uploadDir}/${fileName}`;
        await this.saveFile(file.path, newFilePath);
        await this.deleteFile(file.path); // Suppression du fichier temporaire
        return newFilePath;
    }

    /**
     * Sauvegarde le fichier du chemin source vers le chemin de destination.
     * @param sourcePath Le chemin d'accès du fichier source.
     * @param destinationPath Le chemin d'accès où le fichier doit être sauvegardé.
     */
    private async saveFile(sourcePath: string, destinationPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const stream = createReadStream(sourcePath);
            const writeStream = createWriteStream(destinationPath);
            stream.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }

    /**
     * Supprime un fichier du système de fichiers.
     * @param filePath Le chemin d'accès du fichier à supprimer.
     */
    private async deleteFile(filePath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            unlink(filePath, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
