function pageLoader() {

    let groupNames = ['.wav', 'Activision', 'allAboardGames',
        'BC HUB', 'Dakshs Kittens (listeme)', 'DeerChat',
        'Drawble', 'DSC++', 'GDSC2.0', 'GiveNet', 'Inwit',
        'Its not a bug, its a feature', 'Microsoft',
        'neverOvertime', 'Planners Paradice', 'QTC301',
        'SigmaTech', 'Solhunt', 'Something Random',
        'Stellar', 'StudyTogether', 'UTMarketplace'];

    getAllTimeslots();
    let timeslot = timeSlotGenerator()
    let timeslotAdj = []
    for (let i = 0; i < timeslot.length; i++) {
        timeslotAdj.push(getTime(timeslot[i].substring(0,2),timeslot[i].substring(3,5)))
    }
    $('#timeSlotDropdown').html(makeDropdown(timeslotAdj,timeslot,'selectTime','',null))
    $('#groupNameDropdown').html(makeDropdown(groupNames,groupNames,'selectGroup','',null))

    $('#submit').click(bookTimeslot)
    
}

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

function bookTimeslot() {
    let group = $('#selectGroup').val();
    let time = $('#selectTime').val();
    if ( group == 'null' || time == 'null' ) {
        $('#error').html('<h4>Please select a Group and a Timeslot</h4>');
    }
    postTimeslot(group, time);
}

function getTimeslots (timeSlotJson) {
    let timeSlots = [];
    for (let i = 0; i < timeSlotJson.length; i++) {
        let timeslot = timeSlotJson[i];
        let timeHour = timeslot.time.substring(0,2);
        let timeMin = timeslot.time.substring(3,5);
        timeSlots.push(getTime(timeHour,timeMin));
    }
    return timeSlots;
}

function getTime(hour,min) {
    let curr_hour = hour;
    let daylight = 'PM';
    if (parseInt(hour) < 12 ) {
        daylight = 'AM'
        
    } else if ( parseInt(hour) > 12 )curr_hour -= 12;

    return `${curr_hour}:${min} ${daylight}`
}

function makeTable(rawData) {
    let table = '<table>';
    table += '<tr><th>Group</th><th>Time</th><tr>'
    
	for (let i = 0; i < rawData.length; i++) {
        let timeslot = rawData[i];
        
        let timeHour = timeslot.time.substring(0,2);
        let timeMin = timeslot.time.substring(3,5);
        
        let time = getTime(timeHour, timeMin)
        
		table += `<tr><td> ${timeslot.group} </td> <td> ${time}</td></tr>`
	}
	table += '</table>'
	return table;
}
function makeDropdown(nameList, valueList, id, defaultString, defaultValue) {
    let dropdown = `<select id=${id}> <option value=${defaultValue}>${defaultString}</option>`;
    if (nameList.length != valueList.length) {
        return ''
    }
    for (let i = 0; i < nameList.length; i++) {
        dropdown += `<option value=${valueList[i]}>${nameList[i]}</option>`
    }
    dropdown += '</select>'
    return dropdown;
}