import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CreateMessageDto } from './message.dto';

const createMessageDto: CreateMessageDto = {
  title: 'Example',
  description: 'Notice'
};

describe('MessageController', () => {
  let usersController: MessageController;
  let usersService: MessageService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        MessageService,
        {
          provide: MessageService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation((user: CreateMessageDto) =>
                Promise.resolve({ id: '1', ...user }),
              ),
            findAll: jest.fn().mockResolvedValue([
              {
                firstName: 'firstName #1',
                lastName: 'lastName #1',
              },
              {
                firstName: 'firstName #2',
                lastName: 'lastName #2',
              },
            ]),
            findOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                firstName: 'firstName #1',
                lastName: 'lastName #1',
                id,
              }),
            ),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = app.get<MessageController>(MessageController);
    usersService = app.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('create()', () => {
    it('should create a user', () => {
      usersController.create(createMessageDto);
      expect(usersController.create(createMessageDto)).resolves.toEqual({
        id: '1',
        ...createMessageDto,
      });
      expect(usersService.create).toHaveBeenCalledWith(createMessageDto);
    });
  });

  describe('findAll()', () => {
    it('should find all users ', () => {
      usersController.findAll({
        limit: 10,
        page: 1,
        search: 'search',
        startDate: '2021-01-01',
        endDate: '2021-01-01',
      });
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should find a user', () => {
      expect(usersController.findOne(1)).resolves.toEqual({
        firstName: 'firstName #1',
        lastName: 'lastName #1',
        id: 1,
      });
      expect(usersService.findOne).toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should remove the user', () => {
      usersController.remove(1);
      expect(usersService.remove).toHaveBeenCalled();
    });
  });
});
