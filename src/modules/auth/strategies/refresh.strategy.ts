import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

import { UsersService } from "../../users/users.service";
import { JwtPayload } from "../types/jwt-payload.types";

@Injectable()
export class RefreshStrategy extends PassportStrategy(
    Strategy,
    "refresh",
) {
    constructor(
        configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.refreshToken;
                },
            ]),

            ignoreExpiration: false,

            secretOrKey: configService.getOrThrow<string>(
                "REFRESH_TOKEN_SECRET",
            ),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findById(payload.sub);

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException(
                "Invalid refresh token",
            );
        }

        return user;
    }
}