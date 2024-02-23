// Importations nécessaires pour le module d'authentification
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'prisma.service'; 
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';


@Module({
  // Configuration du module JWT pour l'authentification globale
  imports: [
    JwtModule.register({
      global: true, // Rend le module accessible globalement
      secret: process.env.JWT_SECRET, // Clé secrète pour signer les tokens
      signOptions: { expiresIn: '30d' }, // Options de signature, ici la durée de validité du token
    }),
  ],
  // Enregistrement des contrôleurs utilisés par le module
  controllers: [AuthController],
  // Enregistrement des services et stratégies utilisés par le module
  providers: [AuthService, PrismaService, JwtStrategy, UserService],
})
export class AuthModule {}
