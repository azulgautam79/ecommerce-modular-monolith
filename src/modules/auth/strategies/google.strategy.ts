import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {
    Strategy,
    Profile,
    VerifyCallback,
} from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
    Strategy,
    "google",
) {
    constructor(
        configService: ConfigService,
    ) {
        super({
            clientID: configService.getOrThrow<string>(
                "GOOGLE_CLIENT_ID",
            ),

            clientSecret: configService.getOrThrow<string>(
                "GOOGLE_CLIENT_SECRET",
            ),

            callbackURL: configService.getOrThrow<string>(
                "GOOGLE_CALLBACK_URL",
            ),

            scope: [
                "email",
                "profile",
            ],
        });
    }

    validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ) {
        const email = profile.emails?.[0]?.value;

        if (!email) {
            throw new Error(
                "Google account does not have an email address",
            );
        }

        return {
            provider: "google" as const,
            providerId: profile.id,
            email: email.toLowerCase(),
            userName:
                profile.displayName ||
                profile.name?.givenName ||
                email.split("@")[0],
            avatarUrl:
                profile.photos?.[0]?.value,
        };
    }
}