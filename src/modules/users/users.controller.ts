import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 *! Users API controller
 */
@ApiTags('Users')
// @ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
  *! Get all users [ADMIN]
  */
  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'View all the users',
  })
  @ApiResponse({
    status: 200,
    description: 'All users fetched successfully',
    // type: RegisterResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin can view all users',
  })
  @ApiResponse({
    status: 404,
    description: 'Users doesnot exist',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests',
  })
  findAll() {
    return this.usersService.findAll();
  }

  /**
*! Get users by email [ADMIN]
*/
  @Get('by-email')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get users by email',
  })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
    // type: RegisterResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Users doesnot exist',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests',
  })
  async findByEmail(
    @Query('email') email: string,
  ) {
    return this.usersService.findByEmail(email);
  }


  /**
*! Get users by id [ADMIN]
*/
  @Get(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get users by id',
  })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
    // type: RegisterResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Users doesnot exist',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
