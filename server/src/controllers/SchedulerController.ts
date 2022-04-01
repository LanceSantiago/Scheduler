import { Controller, Get, Post, Delete } from '@overnightjs/core';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoCreds from '../utils/mongodbcreds.json'

const { MongoClient } = require("mongodb");
const url = mongoCreds.uri;
const client = new MongoClient(url);


@Controller('api/schedule')
class SchedulerController {

    // Obtains all appointments
    @Get('appointment')
    public async getAppointment(_req: Request, res: Response) {
        try {
            await client.connect();
            const db = client.db('scheduler');
            const col = db.collection("timeslots");
            let appointments = await col.find().toArray()
            // I probably need a date sorter, but fine for now.
            res.status(StatusCodes.OK).send(appointments);
        } catch {
            res.status(StatusCodes.BAD_REQUEST).send("Something Broke.");
        } finally {
            await client.close();
        }
    }

    // Schedules appointments
    @Post('appointment')
    public async postAppointment(_req: Request, res: Response) {
        if ( !("time" in _req.body) || !("group" in _req.body) ) {
            res.status(StatusCodes.BAD_REQUEST).send("Please specify a timeslot in the format of HH:MM:SS and your group name.");
            return;
        }
        try {
            await client.connect();
            const db = client.db('scheduler');
            const col = db.collection("timeslots");
            let { time, group } = _req.body; // Format: HH:MM:SS
            let filter = {time: time};
            const updateDoc = {
                $set: {
                    group: group
                },
            };
            // I should add some checker to this to see if someone has booked the timeslot or not.
            await col.updateOne(filter, updateDoc);
            res.status(StatusCodes.OK).send("You have booked an appointment for: " + time);
        } catch {
            res.status(StatusCodes.BAD_REQUEST).send("Something Broke.");
        } finally {
            await client.close();
        }
    }

    // Frees up appointments
    @Delete('appointment')
    public async deleteAppointment(_req: Request, res: Response) {
        if ( !("time" in _req.body) || !("group" in _req.body) ) {
            res.status(StatusCodes.BAD_REQUEST).send("Please specify a timeslot in the format of HH:MM:SS and your group name.");
            return;
        }
        try {
            await client.connect();
            const db = client.db('scheduler');
            const col = db.collection("timeslots");
            let { time } = _req.body; // Format: HH:MM:SS
            let filter = {time: time};
            const updateDoc = {
                $set: {
                    group: ""
                },
            };
            await col.updateOne(filter, updateDoc);
            res.status(StatusCodes.OK).send("Appointment " + time + " has been vacated.");
        } catch {
            res.status(StatusCodes.BAD_REQUEST).send("Something Broke.");
        } finally {
            await client.close();
        }
    }

    // Adds Timeslots
    @Post('timeslot')
    public async postTimeslot(_req: Request, res: Response) {
        if ( !("time" in _req.body) ) {
            res.status(StatusCodes.BAD_REQUEST).send("Please specify a timeslot in the format of HH:MM:SS");
            return;
        }
        // I should probably check to make sure time is formatted as HH:MM:SS, though only I will be adding time, shouldn't matter for now.
        try {
            await client.connect();
            const db = client.db('scheduler');
            const col = db.collection("timeslots");
            let { time } = _req.body; // Format: HH:MM:SS
            let timeSplit = time.split(':');
            let date = new Date(2022, 4, 8);
            date.setHours(parseInt(timeSplit[0]), parseInt(timeSplit[1]), parseInt(timeSplit[2]));
            let newTimeSlot = {
                "time": time,
                "date": new Date(2022, 4, 8), // April 8, 2022
                "group": ""                                                                                                            
            }
            await col.insertOne(newTimeSlot);
            res.status(StatusCodes.OK).send("Timeslot added at: " + date);
        } catch {
            res.status(StatusCodes.BAD_REQUEST).send("Could not add additional timeslots. Please ensure that you are specifying a timeslot in the format of HH:MM:SS");
        } finally {
            await client.close();
        }
    }
}

export default SchedulerController;