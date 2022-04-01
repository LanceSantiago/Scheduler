import scheduler from './schedulerServer';

const server = new scheduler();
server.start(8080);
