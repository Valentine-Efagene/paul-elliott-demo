import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import {
    WsResponse,
} from '@nestjs/websockets';
import { EventQueueNames } from "./event.enum";

export class EventDto {
    @ApiProperty({
        example: 'user.created',
    })
    @IsNotEmpty()
    @ApiProperty({
        example: 'efagenevalentine@gmail.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: "Adipisicing ipsum nostrud occaecat non. Aliqua esse fugiat tempor sint.",
    })
    title: string;

    @ApiProperty({
        example: "Adipisicing ipsum nostrud occaecat non. Aliqua esse fugiat tempor sint.",
    })
    message: string;

    @ApiProperty({
        type: 'enum',
        enum: EventQueueNames,
        example: EventQueueNames.MESSAGE,
    })
    type?: EventQueueNames;
}

export class EventData<T> implements WsResponse<T> {
    event: string;
    data: T;
}


