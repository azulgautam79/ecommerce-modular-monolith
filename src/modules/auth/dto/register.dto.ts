import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {

    @ApiProperty({
        description: 'User email address',
        example: 'lemongautam79@gmail.com',
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    @ApiProperty({
        description: 'User password',
        example: 'Lemon123@',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 chearacters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password!: string;

    @ApiProperty({
        description: 'First Name',
        example: 'Lemon',
    })
    @IsString()
    @Length(1, 100)
    firstName!: string;


    @ApiProperty({
        description: 'Last Name',
        example: 'Gautam',
    })
    @IsString()
    @Length(1, 100)
    lastName!: string;
}