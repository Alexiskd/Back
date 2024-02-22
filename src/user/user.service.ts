import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service'; // Assurez-vous que le chemin d'importation est correct

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async getUsers() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                description: true,
            }
        });
        return users;
    }

    async getUser({ userId }: { userId: string }) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                description: true,
            }
        });
        return user;
    }

    async updateDescription(userId: string, newDescription: string) {
        return await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                description: newDescription,
            },
        });
    }

    async updateEmail(userId: string, newEmail: string) {
        // Vérifier si newEmail est au format e-mail valide
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            throw new Error('Adresse e-mail invalide');
        }

        return await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                email: newEmail,
            },
        });
    }
}
