import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { QueryFailedFilter } from './common/common.error';
import { RoleSeeder } from './role/role.seeder';
import { UserSeeder } from './user/user.seeder';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seeding
  const roleSeeder = app.get(RoleSeeder)
  await roleSeeder.seed();

  const userSeeder = app.get(UserSeeder)
  await userSeeder.seed();

  //app.setGlobalPrefix('developer/api');
  app.enableCors();

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));

  // Register MySQL exception filter globally
  app.useGlobalFilters(new QueryFailedFilter());

  const config = new DocumentBuilder()
    .setTitle('User API')
    .setDescription('The API for Paul Elliott')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [AuthModule],
  });
  SwaggerModule.setup('api/docs/user', app, document);

  const adminConfig = new DocumentBuilder()
    .setTitle('Admin API')
    .setDescription('API docs for Admins')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const adminDocument = SwaggerModule.createDocument(app, adminConfig);
  SwaggerModule.setup('/api/docs/admin', app, adminDocument);

  await app.listen(parseInt(process.env.PORT));
}
bootstrap();
