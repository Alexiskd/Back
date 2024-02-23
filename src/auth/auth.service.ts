// Importations nécessaires pour le service d'authentification
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto copy';
import { LogUserDto } from './dto/log-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService, 
        private readonly jwtService: JwtService
    ) {}

    /**
     * Fonction de connexion d'un utilisateur.
     * Valide l'utilisateur avec son email et son mot de passe.
     * @param {LogUserDto} authBody - Le DTO (Data Transfer Object) pour la connexion.
     * @returns L'objet contenant le token JWT si la connexion est réussie.
     */
    async login({ authBody }: { authBody: LogUserDto }) {
        const { email, password } = authBody;

        // Recherche de l'utilisateur par email
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            throw new NotFoundException("L'utilisateur n'existe pas.");
        }

        // Vérification de la validité du mot de passe
        const isPasswordValid = await this.isPasswordValid(password, existingUser.password);
        if (!isPasswordValid) {
            throw new NotFoundException("Le mot de passe est invalide.");
        }

        // Authentification et génération du token JWT
        return this.authenticateUser(existingUser.id);
    }

    /**
     * Fonction d'inscription d'un nouvel utilisateur.
     * Crée un nouvel utilisateur avec les données fournies.
     * @param {CreateUserDto} registerBody - Le DTO pour l'inscription d'un nouvel utilisateur.
     * @returns L'objet contenant le token JWT si l'inscription est réussie.
     */
    async register({ registerBody }: { registerBody: CreateUserDto }) {
        const { email, firstName, lastName, password, description } = registerBody;

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException("Un compte existe déjà !");
        }

        // Hachage du mot de passe et création de l'utilisateur
        const hashedPassword = await this.hashPassword(password);
        const createdUser = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName: lastName || '',
                description: description || 'Ajoutez une description ..',
            },
        });

        // Authentification et génération du token JWT
        return this.authenticateUser(createdUser.id);
    }

    /**
     * Hache le mot de passe fourni.
     * @param {string} password - Le mot de passe à hacher.
     * @returns Le mot de passe haché.
     */
    private async hashPassword(password: string): Promise<string> {
        return hash(password, 10);
    }

    /**
     * Vérifie si le mot de passe fourni correspond au mot de passe haché stocké.
     * @param {string} password - Le mot de passe à vérifier.
     * @param {string} hashedPassword - Le mot de passe haché stocké.
     * @returns Un booléen indiquant si le mot de passe est valide.
     */
    private async isPasswordValid(password: string, hashedPassword: string): Promise<boolean> {
        return compare(password, hashedPassword);
    }

    /**
     * Génère un token JWT pour l'utilisateur authentifié.
     * @param {string} userId - L'ID de l'utilisateur pour lequel générer le token.
     * @returns L'objet contenant le token JWT.
     */
    private async authenticateUser(userId: string) {
        const payload = { userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
