import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { MessageStatus } from './message.enums';

export class CreateMessageDto {
  @ApiProperty({
    example: 'test@tester.com',
  })
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @ApiProperty({
    example: 12345678,
  })
  @IsNotEmpty()
  message: string;

  @ApiProperty({ nullable: true, example: 'https://sch.com' })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => encodeURI(value))
  link?: string;
}

export class UpdateMessageDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  title?: string

  @ApiPropertyOptional({
    nullable: true,
    enum: MessageStatus,
    example: MessageStatus.UNREAD
  })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  message?: string

  @ApiPropertyOptional({
    nullable: true
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  link?: string
}

export class MessageQueryDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    nullable: true,
    enum: MessageStatus,
    example: MessageStatus.UNREAD
  })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  message?: string

  @ApiPropertyOptional({
    nullable: true
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  link?: string

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  limit?: number

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string
}