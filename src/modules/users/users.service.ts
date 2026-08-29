import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateWithPassword } from './dto/create-with-password.dto';
import { User } from '../../database/schema';

export type SafeUser = Omit<
  User,
  | "passwordHash"
  | "refreshTokenHash"
  | "passwordResetTokenHash"
  | "passwordResetTokenExpiresAt"
  | "googleId"
  | "githubId"
>;

@Injectable()
export class UsersService {

  constructor(
    private readonly usersRepository: UsersRepository,
  ) { }

  //? Return this to user
  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  //! Create user with password
  async createWithPassword(createWithPassword: CreateWithPassword) {
    return this.usersRepository.createWithPassword(createWithPassword);
  }

  //! Find all users
  async findAll() {
    return this.usersRepository.findAllUsers();
  }

  //! Find by email
  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  //! Find by id
  async findById(id: string) {
    return this.usersRepository.findById(id);
  }

  //! Find by Google ID
  async findByGoogleId(googleId: string) {
    return this.usersRepository.findByGoogleId(googleId);
  }

  //! Find by GitHub ID
  async findByGithubId(githubId: string) {
    return this.usersRepository.findByGithubId(githubId);
  }

  //! Create OAuth user
  async createOAuthUser(data: {
    userName: string;
    email: string;
    avatarUrl?: string;
    googleId?: string;
    githubId?: string;
  }) {
    return this.usersRepository.createOAuthUser(data);
  }

  //! Link Google ID
  async linkGoogleId(userId: string, googleId: string): Promise<void> {
    return this.usersRepository.linkGoogleId(userId, googleId);
  }

  //! Link GitHub ID
  async linkGithubId(userId: string, githubId: string): Promise<void> {
    return this.usersRepository.linkGithubId(userId, githubId);
  }

  //! Update refresh token hash
  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    return this.usersRepository.updateRefreshTokenHash(
      userId,
      refreshTokenHash,
    );
  }

  //! Clear refresh token hash
  async clearRefreshTokenHash(userId: string): Promise<void> {
    return this.usersRepository.clearRefreshTokenHash(userId);
  }

  //! Set password reset token
  async setPasswordResetToken(
    userId: string,
    passwordResetTokenHash: string,
    passwordResetTokenExpiresAt: Date,
  ): Promise<void> {
    return this.usersRepository.setPasswordResetToken(
      userId,
      passwordResetTokenHash,
      passwordResetTokenExpiresAt,
    );
  }

  //! Reset password
  async resetPassword(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    return this.usersRepository.resetPassword(
      userId,
      passwordHash,
    );
  }

  //! Delete User
  async deleteUser(userId: string): Promise<User | undefined> {
    return this.usersRepository.deleteUser(userId);
  }

  //! Delete Many Users
  async deleteManyUsers(userIds: string[]): Promise<User[]> {
    return this.usersRepository.deleteManyUsers(userIds);
  }

}
