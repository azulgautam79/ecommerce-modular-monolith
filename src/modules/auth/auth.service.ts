import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2'
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly configService: ConfigService,
    ) { }

    //? Generate access and response tokens
    private async generateTokens(
        userId: any,
        email: string,
        role: string,
        rememberMe = false,
        refreshExpiresInSeconds?: number,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: userId, email, role };
        const refreshId = randomBytes(16).toString('hex');

        const refreshExpires = refreshExpiresInSeconds
            ? `${refreshExpiresInSeconds}s`
            : rememberMe
                ? this.configService.get('REFRESH_TOKEN_REMEMBER_TIME') //7d
                : this.configService.get('REFRESH_TOKEN_TIME'); // 1d

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get('ACCESS_TOKEN_TIME'),
            }),
            this.jwtService.signAsync(
                { ...payload, rid: refreshId },
                { expiresIn: refreshExpires },
            ),
        ]);

        return { accessToken, refreshToken };
    }

    //? Update refresh token in database during logins etc
    async updateRefreshToken(
        userId: string,
        refreshToken: string,
        expiresAt: Date,
    ): Promise<void> {
        const hashed = await bcrypt.hash(refreshToken, 10);

        // await this.UserModel.updateOne(
        //     { _id: userId }, // filter
        //     { $set: { refreshToken: hashed, refreshTokenExpiresAt: expiresAt } },
        // );
    }

    //? Response for registration
    private buildResponse(user: any) {
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            rememberMe: user.rememberMe,

        };
    }

    //! Register
    async register(dto: RegisterDto) {
        const email = dto.email.trim().toLowerCase();

        const existingUser = await this.usersRepository.findByEmail(email);

        if (existingUser) {
            this.logger.warn("Email already exist for: ", email)
            throw new ConflictException('An account with this email already exists')
        }

        const passwordHash = await argon2.hash(dto.password, {
            type: argon2.argon2id,
        });

        const user = await this.usersRepository.create({
            email,
            passwordHash,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
        })

        this.logger.log("User registered", email);
        return user;
    }

    //! Login
    async login(loginDto: LoginDto) {

        const { email, password, rememberMe } = loginDto;

        try {
            const refreshExpiresAt = rememberMe
                ? new Date(
                    Date.now() +
                    Number(
                        ms(this.configService.getOrThrow('REFRESH_TOKEN_REMEMBER_TIME')),
                    ),
                )
                : new Date(
                    Date.now() +
                    Number(ms(this.configService.getOrThrow('REFRESH_TOKEN_TIME'))),
                );

            const user = await this.usersRepository.findByEmail(email);

            if (!user) {
                this.logger.warn('Login failed - user not found', { email });
            }

            const validPassword = await argon2.
        } catch (error) {
            this.logger.error("Internal Server Error", error)
        }
    }
}
