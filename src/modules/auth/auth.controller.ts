import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 *! Auth Controller
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }


    /**
   *! Register/ SignUp User
   */
    @Post('register')
    @HttpCode(201)
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account',
    })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        type: String,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request. Validation failed or user already exists',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests',
    })
    async register(
        @Body() dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }
}
