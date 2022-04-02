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