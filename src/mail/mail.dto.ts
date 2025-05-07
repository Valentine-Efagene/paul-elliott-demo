import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMailDto {
  @ApiProperty({ nullable: true, example: 'can_list_properties' })
  name: string;
}

export class SendMailDto {
  @ApiProperty({
    nullable: false,
    example: 'Johnny Ufuoma'
  })
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty({
    nullable: false,
    example: 'johnnyufuoma@testmail.com'
  })
  @IsNotEmpty()
  @IsString()
  receiverEmail?: string;

  @ApiProperty({
    nullable: false,
    example: 'Testing stuff.'
  })
  @IsNotEmpty()
  @IsString()
  message: string
}

export class SendVerificationMailDto {
  @ApiProperty({
    nullable: false,
    example: 'Johnny Ufuoma'
  })
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty({
    nullable: false,
    example: 'johnnyufuoma@testmail.com'
  })
  @IsNotEmpty()
  @IsString()
  link?: string;

  @ApiProperty({
    nullable: false,
    example: 'johnnyufuoma@testmail.com'
  })
  @IsNotEmpty()
  @IsString()
  receiverEmail?: string;
}
