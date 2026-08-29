import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import ms from 'ms'
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
/**
 *! Auth Controller
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    /**
   *! Register/ SignUp User
   */
    @Post('register')
    @HttpCode(201)
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account',
    })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        type: String,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request. Validation failed or user already exists',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests',
    })
    async register(
        @Body() dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }

    /**
      *! Login User
      */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    // @StrictThrottler()
    @ApiOperation({
        summary: 'Login user',
        description:
            'Authenticates a user and returns access token, refresh token stored in httpOnly cookie',
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized. Invalid credentials or Email is unverified.',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests',
    })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const { accessToken, refreshToken, user } =
            await this.authService.login(loginDto);

        const ttl = loginDto.rememberMe
            ? Number(ms(this.configService.getOrThrow('REFRESH_TOKEN_REMEMBER_TIME')))
            : Number(ms(this.configService.getOrThrow('REFRESH_TOKEN_TIME')));

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite:
                this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: ttl,
        });

        return {
            accessToken,
            user,
        };
    }
}
