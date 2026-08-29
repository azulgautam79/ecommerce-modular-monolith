import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import ms from 'ms'
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthResult } from './auth.service';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './types/authenticated-request.types';
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
       *! Register / Sign Up User
       */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully registered',
        type: AuthResult,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'An account with this email already exists',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Too Many Requests',
    })
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResult> {
        const {
            accessToken,
            refreshToken,
            user,
        } = await this.authService.register(dto);

        const refreshTokenExpiresIn =
            this.configService.getOrThrow<string>(
                'REFRESH_TOKEN_EXPIRES_IN',
            );

        const ttl = Number(ms(refreshTokenExpiresIn));

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure:
                this.configService.get<string>('NODE_ENV') ===
                'production',
            sameSite:
                this.configService.get<string>('NODE_ENV') ===
                    'production'
                    ? 'none'
                    : 'lax',
            path: '/',
            maxAge: ttl,
        });

        return {
            accessToken,
            user,
        };
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
        type: AuthResult,
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
    ): Promise<AuthResult> {
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

    //! Get Me
    @Get("me")
    @UseGuards(JwtAuthGuard)
    me(
        @Req() req: AuthenticatedRequest,
    ) {
        return req.user;
    }

    @Get("google")
    @UseGuards(AuthGuard("google"))
    googleLogin() {
        // Passport redirects to Google
    }

    @Get("google/callback")
    @UseGuards(AuthGuard("google"))
    async googleCallback(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const result =
            await this.authService.oauthLogin(req.user);

        // set refresh token cookie
        // redirect frontend
    }

    @Get("github")
    @UseGuards(AuthGuard("github"))
    githubLogin() { }

    @Get("github/callback")
    @UseGuards(AuthGuard("github"))
    async githubCallback(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const result =
            await this.authService.oauthLogin(req.user);

        // set cookie
        // redirect frontend
    }



    @UseGuards(RefreshAuthGuard)
    @Post("refresh")
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = req.user;

        const refreshToken = req.cookies.refreshToken;

        return this.authService.refresh(user, refreshToken);
    }
}
