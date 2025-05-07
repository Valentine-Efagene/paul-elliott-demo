
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { LocalStrategy } from './strategy/local_strategy';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { RefreshTokenModule } from 'src/refresh_token/refresh_token.module';
import { JwtStrategy } from './strategy/jwt_strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60s' },
        }),
        RefreshTokenModule,
        MailModule
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
