import { Inject, Injectable } from "@nestjs/common";
import {
    DATABASE,
    type Database
} from "../../database/database.provider";
import { users } from "../../database/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class UsersRepository {
    constructor(
        @Inject(DATABASE)
        private readonly db: Database,
    ) { }

    //! Find by email
    async findByEmail(email: string) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return result[0] ?? null
    }

    //! Create user
    async create(data: {
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
    }) {
        const result = await this.db
            .insert(users)
            .values({
                email: data.email,
                passwordHash: data.passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
            })
            .returning({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                emailVerifiedAt: users.emailVerifiedAt,
                createdAt: users.createdAt,
            });

        return result[0];
    }
}