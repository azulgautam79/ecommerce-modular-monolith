import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role';

export class UserResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    firstname!: string;

    @ApiProperty()
    lastname!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ enum: Role })
    role!: Role;
}
