import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt/dist';
import { PrismaService } from 'prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,PrismaService,JwtStrategy,UserService]
})
export class AuthModule {}
