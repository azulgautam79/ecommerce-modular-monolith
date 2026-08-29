export type OAuthUser = {
    provider: "google" | "github";
    providerId: string;
    email: string;
    userName: string;
    avatarUrl?: string;
};