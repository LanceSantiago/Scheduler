import { Server } from '@overnightjs/core';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as path from 'path';
import Controllers from './controllers';
import { PUBLIC_PATHS } from './utils/constants';
import mongoCreds from './utils/mongodbcreds.json'
const { MongoClient } = require("mongodb");
const url = mongoCreds.uri;
const client = new MongoClient(url);

class Scheduler extends Server {

    private readonly SERVER_START_MSG = 'Scheduler started on port: ';

    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.checkMongo();
        this.setupControllers();
        this.app.all(/api\/.*/, (_req, res) => res.status(StatusCodes.NOT_ACCEPTABLE).end());
    }

    public start(port: number): void {
        this.app.listen(port);
    }

    private setupControllers(): void {
        const ctlrInstances = [];
        for (const Controller of Controllers) {
            ctlrInstances.push(new Controller())
        }
        super.addControllers(ctlrInstances);
    }
    
    private checkMongo(): void {
        try {
            client.connect();
            console.log("Connected to Mongo Server");
        } catch (err: any) {
            console.log("Mongo Servr - Error Occured:\n")
            console.log(err.stack);
        }
        finally {
            client.close();
        }
    }
}

export default Scheduler;
