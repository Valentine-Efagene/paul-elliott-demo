import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
        });
    }

    onModuleInit() {
        console.log('RedisService initialized');
    }

    onModuleDestroy() {
        this.redis.quit();
    }

    async set(key: string, value: string): Promise<void> {
        await this.redis.set(key, value);
    }

    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async addToSet(key: string, value: string): Promise<void> {
        await this.redis.sadd(key, value);
    }

    async removeFromSet(key: string, value: string): Promise<void> {
        await this.redis.srem(key, value);
    }

    async getSetMembers(key: string): Promise<string[]> {
        return this.redis.smembers(key);
    }
}
