//let BASE_URL = 'scheduler.lancesantiago.com:8080';
let BASE_URL = 'http://scheduler.lancesantiago.com:8080'
let API_URL_PREFIX = `${BASE_URL}/api/schedule`
/**
 * 
 * GET Request
 * all API Request
 * Displays a table upon completion
 * or prints errors if it fails.
 * 
 */
function getAllTimeslots() {
    $.ajax({
        url: `${API_URL_PREFIX}/appointment/`,
        method: 'GET',
        contentType: 'application/json;charset=UTF-8',
    }).done((data) => {
        if ( data.message ) {
            $('#table').html(`<p> ${data.message} </p`)
        } else { 
            
            $('#table').html(makeTable(data))
        }
    }).fail((data, textStatus, xhr) => {
        console.log(data);
        console.log(textStatus);
    })
}

function postTimeslot(group, time) {
    let payload = { 'group': group, 'time': time };
    $.ajax({
        url: `${API_URL_PREFIX}/appointment/`,
        method: 'POST',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(payload),
    }).done((data) => {
        if ( data ) {
            $('#error').html(`<p> ${data} </p`)
            getAllTimeslots();
        } else { 
            $('#error').html('An error has occured.')
            
        }
    }).fail((data, textStatus, xhr) => {
        $('#error').html(`<p> ${data.responseText} </p`)
        console.log(xhr.status);
        console.log(data);
        console.log(textStatus);
    })

}