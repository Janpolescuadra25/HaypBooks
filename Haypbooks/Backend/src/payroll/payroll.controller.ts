import { Body, Controller, Post } from '@nestjs/common'
import { PayrollService } from './payroll.service'

@Controller('/api/payroll')
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  @Post('preview')
  async preview(@Body() body: any) {
    const tenantId = body.tenantId
    return this.payroll.calculate(tenantId, body.rows || [])
  }

  @Post('submit')
  async submit(@Body() body: any) {
    const tenantId = body.tenantId
    return this.payroll.submit(tenantId, { rows: body.rows || [], startDate: body.startDate, endDate: body.endDate, description: body.description })
  }
}
