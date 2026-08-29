import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(
    Strategy,
    "github",
) {
    constructor(
        configService: ConfigService,
    ) {
        super({
            clientID: configService.getOrThrow<string>(
                "GITHUB_CLIENT_ID",
            ),

            clientSecret: configService.getOrThrow<string>(
                "GITHUB_CLIENT_SECRET",
            ),

            callbackURL: configService.getOrThrow<string>(
                "GITHUB_CALLBACK_URL",
            ),

            scope: [
                "user:email",
            ],
        });
    }

    validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
    ) {
        const email =
            profile.emails?.find(
                (email: any) => email.primary,
            )?.value ||
            profile.emails?.[0]?.value;

        if (!email) {
            throw new Error(
                "GitHub account does not have an email address",
            );
        }

        return {
            provider: "github" as const,
            providerId: profile.id,
            email: email.toLowerCase(),
            userName:
                profile.username ||
                profile.displayName ||
                email.split("@")[0],
            avatarUrl: profile.photos?.[0]?.value,
        };
    }
}