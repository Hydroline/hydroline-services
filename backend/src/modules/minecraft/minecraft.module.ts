import { Module } from '@nestjs/common';
import { MinecraftController } from './minecraft.controller';

@Module({
  controllers: [MinecraftController],
})
export class MinecraftModule {} 