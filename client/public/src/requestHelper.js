function pageLoader() {
    getAllTimeslots();
}
    

function makeTable(rawData) {
    let table = '<table>';
    table += '<tr><th>Group</th><th>Time</th><tr>'
    
	for (let i = 0; i < rawData.length; i++) {
        let timeslot = rawData[i];
        let daylight = 'PM';
        let timeHour = timeslot.time.substring(0,2);
        let timeMin = timeslot.time.substring(3,5);
        
        if (parseInt(timeHour) < 12 ) {
            daylight = 'AM'
        }
		table += `<tr><td> ${timeslot.group} </td> <td> ${timeHour}:${timeMin} ${daylight}</td></tr>`
	}
	table += '</table>'
	return table;
}