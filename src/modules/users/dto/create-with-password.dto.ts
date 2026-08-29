import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

export class CreateWithPassword {

    @ApiProperty({
        description: 'User Name',
        example: 'Lemon Gautam',
        required: false,
    })
    @IsString()
    userName!: string;

    @ApiProperty({
        description: 'User email address',
        example: 'lemongautam79@gmail.com',
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    @ApiProperty({
        description: 'User Name',
        example: 'Lemon Gautam',
        required: false,
    })
    @IsString()
    passwordHash!: string;
}
