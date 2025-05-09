// src/role/role.seeder.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleSeeder {
    private readonly logger = new Logger(RoleSeeder.name);

    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async seed() {
        const rolesToSeed = ['user', 'admin'];

        for (const roleName of rolesToSeed) {
            const exists = await this.roleRepository.findOne({ where: { name: roleName } });
            if (!exists) {
                const role = this.roleRepository.create({ name: roleName });
                await this.roleRepository.save(role);
                this.logger.log(`Seeded role: ${roleName}`);
            }
        }
    }
}
