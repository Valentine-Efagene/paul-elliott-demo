
import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto, SignInDto, SignUpDto } from './auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from 'src/common/common.dto';
import { ResponseMessage } from 'src/common/common.enum';
import { SerializeUser } from './decorator';
import { User } from 'src/user/user.entity';
import { SwaggerAuth } from 'src/common/guard/swagger-auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { IAuthTokensAndUser } from './auth.type';
import { UserService } from 'src/user/user.service';

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly userService: UserService
    ) { }

    @HttpCode(HttpStatus.OK)
    @Throttle({
        default: {
            limit: 3,
            ttl: 60000
        }
    })
    @Post('sign-in')
    async signIn(
        @Body() dto: SignInDto,
    ): Promise<StandardApiResponse<IAuthTokensAndUser>> {
        const response = await this.authService.signIn(dto);
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.AUTHENTICATED, response)
    }

    @HttpCode(HttpStatus.OK)
    @Post('sign-up')
    async signUp(@Body() dto: SignUpDto): Promise<StandardApiResponse<string>> {
        const response = await this.authService.signUp(dto);
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.CREATED, response)
    }

    @HttpCode(HttpStatus.OK)
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string): Promise<StandardApiResponse<string>> {
        const response = await this.authService.verifyEmail(token);
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.CREATED, response)
    }

    @SwaggerAuth()
    @Post('refresh')
    async refreshToken(@SerializeUser() user: User, @Body() dto: RefreshTokenDto): Promise<StandardApiResponse<{ accessToken: string }>> {
        const tokens = await this.authService.refreshToken(user, dto)
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.CREATED, tokens);
    }

    @SwaggerAuth()
    @Get('current-user')
    async currentUser(
        @SerializeUser() user: User,
    ): Promise<StandardApiResponse<User>> {
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.CREATED, user);
    }
}
