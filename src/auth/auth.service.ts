import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Userpayload } from './jwt.strategy';
import { LogUserDto } from './dto/log-user.dto';
import { CreateUserDto } from './dto/create-user.dto copy';


@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

    async login({ authBody }: { authBody: LogUserDto }) {
        const { email, password } = authBody;
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!existingUser) {
            throw new NotFoundException("L'utilisateur n'existe pas.");
        }

        const isPasswordValid = await this.isPasswordValid({ password, hashedPassword: existingUser.password });
        if (!isPasswordValid) {
            throw new Error("Le mot de passe est invalide.");
        }
        return this.authenticateUser({ userId: existingUser.id });
    }

    private async hashPassword({ password }: { password: string }) {
        const hashedPassword = await hash(password, 10);
        return hashedPassword;
    }

    async register({ registerBody }: { registerBody: CreateUserDto }) {
        const { email, firstName, lastName, password, description } = registerBody;
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (existingUser) {
            throw new ConflictException("Un compte existe déjà !");
        }

        const hashedPassword = await this.hashPassword({ password });
        const createdUser = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName: lastName || '',
                description: description || 'Ajoutez une description ..',
            },
        });

        return this.authenticateUser({ userId: createdUser.id });
    }

    private async isPasswordValid({ password, hashedPassword }: { password: string; hashedPassword: string }) {
        const isPasswordValid = await compare(password, hashedPassword);
        return isPasswordValid;
    }

    private async authenticateUser({ userId }: Userpayload) {
        const payload: Userpayload = { userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
