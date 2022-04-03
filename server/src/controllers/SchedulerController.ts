import { Controller, Get, Post, Delete } from '@overnightjs/core';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoCreds from '../utils/mongodbcreds.json';
import * as fs from 'fs';

const { MongoClient } = require("mongodb");
const url = mongoCreds.uri;
const client = new MongoClient(url);

const API_PASSWORD = "password"
const GROUP_NAMES = ['.wav', 'Activision', 'allAboardGames',
'BC HUB', 'Dakshs Kittens (listeme)', 'DeerChat',
'Drawble', 'DSC++', 'GDSC2.0', 'GiveNet', 'Inwit',
'Its not a bug, its a feature', 'Microsoft',
'neverOvertime', 'Planners Paradice', 'QTC301',
'SigmaTech', 'Solhunt', 'Something Random',
'Stellar', 'StudyTogether', 'UTMarketplace'];

function timeSlotGenerator() {
    let timeslot = ['09:00:00', '09:20:00', '09:40:00']
    let startTimeHour = 10;
    let currMin = 0;

    for ( let i = 0; i < 28; i++ ) {
        let extraZero = '';
        if (currMin == 0) extraZero += '0'
        timeslot.push(`${startTimeHour.toString()}:${extraZero}${currMin.toString()}:00`);
        currMin += 20;
        if ( currMin >= 60) {
            startTimeHour += 1;
            currMin = 0;
        }
    }
    return timeslot;
}

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
            res.status(StatusCodes.BAD_REQUEST).send("Please specify a timeslot in the format of HH:MM:SS, \
            and a group name.");
            return;
        }
        try {
            await client.connect();
            const db = client.db('scheduler');
            const col = db.collection("timeslots");
            let { time, group } = _req.body; // Format: HH:MM:SS

            // Check if group has scheduled an appointment already.
            let groupFind = await col.findOne( { "group": group } )
            if ( groupFind ) {
                res.status(StatusCodes.UNAUTHORIZED).send("You have already booked an appointment at: " 
                + groupFind.time);
                return;
            }
            
            // Checks to see if someone has booked the timeslot.
            let timeFind = await col.findOne( { "time": time } )
            if ( timeFind.group != '' ) {
                res.status(StatusCodes.UNAUTHORIZED).send(`Group ${timeFind.group} \
                has currently booked the timeslot ${timeFind.time}`);
                return;
            }
            let filter = {time: time};
            const updateDoc = {
                $set: {
                    group: group
                },
            };

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
        if ( !("time" in _req.body) || !("group" in _req.body) || !("password" in _req.body) ) {
            res.status(StatusCodes.BAD_REQUEST).send("Please specify a timeslot in the format of HH:MM:SS, \
            a group name and the password.");
            return;
        }
        if (_req.body.password != API_PASSWORD) { 
            res.status(StatusCodes.UNAUTHORIZED).send("Wrong Password.")
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
        if ( !("time" in _req.body) || !("password" in _req.body) ) {
            res.status(StatusCodes.BAD_REQUEST).send("Please specify a timeslot in the format of HH:MM:SS and the password.");
            return;
        }

        if (_req.body.password != API_PASSWORD) { 
            res.status(StatusCodes.UNAUTHORIZED).send("Wrong Password.")
            return;
        }
        // I should probably check to make sure time is formatted as HH:MM:SS, 
        // though only I will be adding time, shouldn't matter for now.
        try {
            await client.connect();
            const db = client.db('scheduler');
            const col = db.collection("timeslots");
            let { time } = _req.body; // Format: HH:MM:SS
            let timeSplit = time.split(':');
            let date = new Date(2022, 4, 8);
            date.setHours(parseInt(timeSplit[0]), parseInt(timeSplit[1]), parseInt(timeSplit[2]));
            
            // Eventually change insertOne to updateOne with const options = { upsert: true };.
            // To avoid any duplicates.

            let filter = {time: time};
            let options = { upsert: true };
            const updateDoc = {
                $set: {
                    'time': time,
                    'date': new Date(2022, 4, 8), // April 8, 2022
                    'group': '' 
                },
            };
            await col.updateOne(filter, updateDoc, options); 
            res.status(StatusCodes.OK).send("Timeslot added at: " + date);
        } catch {
            res.status(StatusCodes.BAD_REQUEST).send("Could not add additional timeslots. \
            Please ensure that you are specifying a timeslot in the format of HH:MM:SS");
        } finally {
            await client.close();
        }
    }
    @Delete('reset')
    public async postReset(_req: Request, res: Response) {
        if ( !("password" in _req.body) ) {
            res.status(StatusCodes.BAD_REQUEST).send("Please specify the password.");
            return;
        }

        if (_req.body.password != API_PASSWORD) { 
            res.status(StatusCodes.UNAUTHORIZED).send("Wrong Password.")
            return;
        }
        try {
            await client.connect();
            const db = client.db('scheduler');
            const col = db.collection("timeslots");
            let timeslots = timeSlotGenerator();
            let date = new Date(2022, 4, 8);
            for ( let i = 0; i < timeslots.length; i++ ){
                date.setHours(parseInt(timeslots[i].substring(0,2)), parseInt(timeslots[i].substring(3,5)),0);
                let filter = {time: timeslots[i]};
                let options = { upsert: true };
                const updateDoc = {
                    $set: {
                        'time': timeslots[i],
                        'date': new Date(2022, 4, 8), // April 8, 2022
                        'group': '' 
                    },
                }
                await col.updateOne(filter, updateDoc, options); 
            };
            res.status(StatusCodes.OK).send('Database has been reset.');
        } catch(err) {
            console.log(err);
            res.status(StatusCodes.BAD_REQUEST).send("Something went wrong.");
        } finally {
            await client.close();
        }
    }

    @Get('backup')
    public async backupTimeslots(_req: Request, res: Response){
        try {
            await client.connect();
            const db = client.db('scheduler');
            const col = db.collection("timeslots");
            let appointments = await col.find().toArray()
            let currDate = new Date();

            let file = fs.createWriteStream(__dirname +`/${currDate.getDate()}-${currDate.getDay()}-\
${currDate.getFullYear()}--${currDate.getHours()}-${currDate.getMinutes()}-backup.json`);
            file.on('error', function(err) { console.log('error while writing to file') });
            for (let i = 0; i < appointments.length; i++) {
                file.write(JSON.stringify(appointments[i])+'\n')
            }
            file.end();
            res.status(StatusCodes.OK).send('File has been backed up.');
        } catch(err) {
            console.log(err);
            res.status(StatusCodes.BAD_REQUEST).send("Something went wrong.");
        } finally {
            await client.close();
        }
        
    }
}

export default SchedulerController;