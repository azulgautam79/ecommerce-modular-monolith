import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class DeleteManyUsersDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    userIds!: string[];
}
