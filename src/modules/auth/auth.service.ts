import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2'

@Injectable()
export class AuthService {

    constructor(
        private readonly usersRepository: UsersRepository,
    ) { }


    //! Register
    async register(dto: RegisterDto) {
        const email = dto.email.trim().toLowerCase();

        const existingUser = await this.usersRepository.findByEmail(email);

        if (existingUser) {
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

        return user;
    }
}
