import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

@Controller('api/schedule')
class SchedulerController {
    @Get('appointment')
    public async getTimeSlots(_req: Request, res: Response) {
        try {

        } catch {

        }
    }
}

export default SchedulerController;