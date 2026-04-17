import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  JsonResponse,
  ResponseHelper,
} from '@miguelcazares/nestjs-response-helper';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new owner account' })
  async register(
    @Body() dto: RegisterDto,
  ): Promise<JsonResponse<{ accessToken: string }>> {
    const result = await this.authService.register(dto);
    return ResponseHelper.jsendSuccess(result, HttpStatus.CREATED);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login and receive a JWT token' })
  async login(
    @Body() dto: LoginDto,
  ): Promise<JsonResponse<{ accessToken: string }>> {
    const result = await this.authService.login(dto);
    return ResponseHelper.jsendSuccess(result);
  }
}
