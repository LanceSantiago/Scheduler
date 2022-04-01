import SchedulerController from './SchedulerController';

const Controllers = [
    SchedulerController
];

export default Controllers;

export const escapeString = (needEscape: string) => {
    return needEscape;
    return needEscape.replace(/[,\/#!$%\^&\*;:{}=`~()'"<>]/g,'');
}