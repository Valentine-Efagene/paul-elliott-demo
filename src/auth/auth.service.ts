
import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { RefreshTokenDto, SignInDto, SignUpDto } from './auth.dto';
import { User } from '../user/user.entity';
import { IAccessTokenPayload, IAuthTokensAndUser, IJwtConfig } from './auth.type';
import { RefreshTokenService } from 'src/refresh_token/refresh_token.service';
import { accessTokenConfig, refreshTokenConfig } from './auth.constants';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private mailService: MailService,
        private refreshTokenService: RefreshTokenService,
    ) { }

    async validateUser(identifier: string, password: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.userService.findOneByEmail(identifier);

        if (!user) {
            return null
        }

        const match = await bcrypt.compare(password, user.password)

        if (match) {
            const { password, ...result } = user;
            return result;
        }

        return null;
    }

    async signUp(user: SignUpDto): Promise<string> {
        const existingUser = await this.userService.findOneByEmail(user.email);

        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const newUser = await this.userService.create(user);
        const verificationToken = randomBytes(32).toString('hex');
        const updated = await this.userService.updateOne(newUser.id, {
            emailVerificationToken: verificationToken
        })

        if (!updated) {
            throw new InternalServerErrorException('Something went wrong')
        }

        await this.mailService.sendEmailVerification({
            link: `localhost:3100/auth/verify-email?token=${verificationToken}`,
            name: 'Valentyne',
            receiverEmail: newUser.email
        })

        return 'Account created. Please check for verification email.'
    }

    async verifyEmail(token: string) {
        const user = await this.userService.findOneByEmailVerificationToken(token)

        if (!user) {
            throw new BadRequestException('Invalid token')
        }

        const updatedUser = await this.userService.updateOne(user.id, {
            isEmailVerified: true,
        })

        return 'You may now proceed to log in.'
    }

    async generateJWT(payload: IAccessTokenPayload, config: IJwtConfig) {
        return this.jwtService.sign(payload, {
            secret: config.secret,
            expiresIn: config.expiresIn,
        });
    }

    async refreshToken(
        user: User,
        dto: RefreshTokenDto,
    ): Promise<{ accessToken: string }> {
        const refreshToken = await this.refreshTokenService.findOneByToken(dto.refreshToken);

        if (!refreshToken) {
            throw new UnauthorizedException();
        }

        const payload: IAccessTokenPayload = {
            sub: user.id,
            identifier: user.email,
        };

        const accessToken = await this.generateJWT(payload, accessTokenConfig());
        await this.refreshTokenService.replaceToken({
            token: accessToken,
            userId: user.id
        })

        return {
            accessToken,
        };
    }

    async signIn(dto: SignInDto): Promise<IAuthTokensAndUser> {
        const user = await this.validateUser(dto.identifier, dto.password)

        if (!user) {
            throw new BadRequestException('Invalid credentials');
        }

        const payload: IAccessTokenPayload = {
            sub: user.id,
            identifier: user.email,
        };

        const accessToken = await this.generateJWT(payload, accessTokenConfig());
        const refreshToken = await this.generateJWT(payload, refreshTokenConfig());

        const doc = await this.refreshTokenService.findOneByUserId(user.id)

        if (doc) {
            await this.refreshTokenService.replaceToken({ token: refreshToken, userId: user.id });

            return {
                accessToken,
                refreshToken,
                user
            };
        }

        await this.refreshTokenService.create({
            userId: user.id,
            token: refreshToken,
        });

        return {
            accessToken,
            refreshToken,
            user
        };
    }
}
