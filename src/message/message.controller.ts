import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
  Patch,
  Query,
} from '@nestjs/common';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { CreateMessageDto, MessageQueryDto, UpdateMessageDto } from './message.dto';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@SwaggerAuth()
@Controller('message')
@ApiTags('Message')
@ApiResponse(OpenApiHelper.responseDoc)
export class MessageController {
  constructor(
    private readonly notificationService: MessageService,
  ) { }

  @SwaggerAuth()
  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<StandardApiResponse<Message>> {
    const data = await this.notificationService.create(createMessageDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @SwaggerAuth()
  @Patch('/:id')
  @ApiOperation({
    summary: 'Update notification',
    description: '',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMessageDto,
  ): Promise<StandardApiResponse<Message>> {
    const data = await this.notificationService.updateOne(id, body);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @SwaggerAuth()
  @Get(':id')
  @ApiResponse(OpenApiHelper.responseDoc)
  async findOne(
    @Param('id', ParseIntPipe) id: number,): Promise<StandardApiResponse<Message>> {
    const data = await this.notificationService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Delete(':id')
  @SwaggerAuth()
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @ApiResponse(OpenApiHelper.nullResponseDoc)
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.notificationService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }

  @SwaggerAuth()
  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(
    @Query() query: MessageQueryDto,
  ): Promise<StandardApiResponse<Message[]>> {
    const data = await this.notificationService.findAll(query);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }
}
