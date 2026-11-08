import { Module } from '@nestjs/common';
import { TransitsService } from './transits.service';
import { TransitsController } from './transits.controller';

@Module({
  controllers: [TransitsController],
  providers: [TransitsService],
  exports: [TransitsService],
})
export class TransitsModule {}