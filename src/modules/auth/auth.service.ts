import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2'
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.types';
import { UsersService } from '../users/users.service';
import type { SafeUser } from '../users/users.service';
import { User } from '../../database/schema';
import { OAuthUser } from './types/oauth-user.type';
import { UserRole } from './enums/user-role.enum';

export type AuthResult = {
    user: SafeUser,
    accessToken: string,
    refreshToken: string,
}

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,

        private readonly userService: UsersService,
    ) { }


    //? Normalize Email
    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    //? Generate Access Token
    private generateAccessToken(payload: JwtPayload): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.configService.getOrThrow<string>("ACCESS_TOKEN_SECRET"),
            expiresIn: this.configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRES_IN') as JwtSignOptions['expiresIn'],
        });
    }

    //? Generate Refresg Token
    private generateRefreshToken(
        payload: JwtPayload,
        expiresIn: JwtSignOptions['expiresIn'],
    ): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.configService.getOrThrow<string>(
                'REFRESH_TOKEN_SECRET',
            ),
            expiresIn,
        });
    }

    //? Issue Tokens
    private async issueTokens(
        payload: JwtPayload,
        refreshExpiresIn: JwtSignOptions['expiresIn'],
    ): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload, refreshExpiresIn),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    //! Register
    async register(dto: RegisterDto): Promise<AuthResult> {
        const email = this.normalizeEmail(dto.email)
        const userName = dto.userName;

        const existingUser = await this.userService.findByEmail(email);

        if (existingUser) {
            this.logger.warn("Email already exist for: ", email)
            throw new ConflictException('An account with this email already exists')
        }

        const passwordHash = await argon2.hash(dto.password, {
            type: argon2.argon2id,
        });

        const user = await this.userService.createWithPassword({
            userName,
            email,
            passwordHash,
        })

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role as UserRole,
        };

        const refreshExpiresIn =
            this.configService.getOrThrow<string>(
                'REFRESH_TOKEN_EXPIRES_IN',
            ) as JwtSignOptions['expiresIn'];

        const { accessToken, refreshToken } =
            await this.issueTokens(
                payload,
                refreshExpiresIn,
            );

        const refreshTokenHash = await argon2.hash(refreshToken);
        await this.userService.updateRefreshTokenHash(user.id, refreshTokenHash);

        this.logger.log("User registered", email);
        return {
            user: this.userService.toSafeUser(user),
            accessToken,
            refreshToken
        }
    }

    //! Login
    async login(loginDto: LoginDto): Promise<AuthResult> {

        const email = this.normalizeEmail(loginDto.email);

        const user = await this.userService.findByEmail(email);

        if (!user || !user.passwordHash) {
            this.logger.warn('Login failed - user not found', { email });
            throw new UnauthorizedException('Invalid email or password')
        }

        try {
            const refreshExpiresIn = loginDto.rememberMe
                ? this.configService.getOrThrow<string>(
                    'REFRESH_TOKEN_REMEMBER_TIME',
                )
                : this.configService.getOrThrow<string>(
                    'REFRESH_TOKEN_EXPIRES_IN',
                );

            const validPassword = await argon2.verify(
                user.passwordHash,
                loginDto.password
            );
            if (!validPassword) {
                this.logger.warn('Login failed - Incorrect Password');
                throw new UnauthorizedException('Invalid email or password')
            }

            const payload: JwtPayload = {
                sub: user.id,
                email: user.email,
                role: user.role as UserRole,
            };

            const { accessToken, refreshToken } =
                await this.issueTokens(
                    payload,
                    refreshExpiresIn as JwtSignOptions['expiresIn'],
                );

            const refreshTokenHash = await argon2.hash(refreshToken);
            await this.userService.updateRefreshTokenHash(user.id, refreshTokenHash)

            return {
                user: this.userService.toSafeUser(user),
                accessToken,
                refreshToken
            }

        } catch (error) {
            this.logger.error("Internal Server Error", error)
            throw error;
        }
    }

    //! Refresh the token
    async refresh(
        user: User,
        refreshToken: string,
    ): Promise<AuthResult> {

        const valid = await argon2.verify(
            user.refreshTokenHash!,
            refreshToken,
        );

        if (!valid) {
            await this.userService.clearRefreshTokenHash(user.id);

            throw new UnauthorizedException(
                "Invalid refresh token",
            );
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role as UserRole,
        };

        const { accessToken, refreshToken: newRefreshToken } =
            await this.issueTokens(
                payload,
                this.configService.getOrThrow<string>(
                    "REFRESH_TOKEN_EXPIRES_IN",
                ) as JwtSignOptions["expiresIn"],
            );

        const newRefreshTokenHash =
            await argon2.hash(newRefreshToken);

        await this.userService.updateRefreshTokenHash(
            user.id,
            newRefreshTokenHash,
        );

        return {
            user: this.userService.toSafeUser(user),
            accessToken,
            refreshToken: newRefreshToken,
        };
    }



    //! OAuth Login
    async oauthLogin(data: OAuthUser): Promise<AuthResult> {

        let user: User | undefined;

        if (data.provider === "google") {
            user = await this.userService.findByGoogleId(
                data.providerId,
            );
        }

        if (data.provider === "github") {
            user = await this.userService.findByGithubId(
                data.providerId,
            );
        }

        // Existing provider account
        if (!user) {
            user = await this.userService.findByEmail(
                data.email,
            );
        }

        // Existing account with same email
        if (user) {

            if (
                data.provider === "google" &&
                !user.googleId
            ) {
                await this.userService.linkGoogleId(
                    user.id,
                    data.providerId,
                );

                user.googleId = data.providerId;
            }

            if (
                data.provider === "github" &&
                !user.githubId
            ) {
                await this.userService.linkGithubId(
                    user.id,
                    data.providerId,
                );

                user.githubId = data.providerId;
            }

        } else {

            // Completely new account
            user = await this.userService.createOAuthUser({
                userName: data.userName,
                email: data.email,
                avatarUrl: data.avatarUrl,

                googleId:
                    data.provider === "google"
                        ? data.providerId
                        : undefined,

                githubId:
                    data.provider === "github"
                        ? data.providerId
                        : undefined,
            });
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role as UserRole,
        };

        const refreshExpiresIn =
            this.configService.getOrThrow<string>(
                "REFRESH_TOKEN_EXPIRES_IN",
            ) as JwtSignOptions["expiresIn"];

        const {
            accessToken,
            refreshToken,
        } = await this.issueTokens(
            payload,
            refreshExpiresIn,
        );

        const refreshTokenHash =
            await argon2.hash(refreshToken);

        await this.userService.updateRefreshTokenHash(
            user.id,
            refreshTokenHash,
        );

        return {
            user: this.userService.toSafeUser(user),
            accessToken,
            refreshToken,
        };
    }


}
