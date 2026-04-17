import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOwnerDto {
  @ApiProperty({ example: 'Juan Pérez', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @MinLength(2, { message: 'name too short' })
  @MaxLength(100, { message: 'name too long' })
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail({}, { message: 'invalid email format' })
  @MaxLength(150, { message: 'email too long' })
  email: string;

  @ApiProperty({ example: 'strongPassword123', minLength: 8 })
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  password: string;
}
