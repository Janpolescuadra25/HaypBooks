import { Module } from '@nestjs/common'
import { TestController } from './test.controller'
import { TestEndpointGuard } from './test.guard'

@Module({
  controllers: [TestController],
  providers: [TestEndpointGuard],
  exports: [TestEndpointGuard],
})
export class TestModule {}
