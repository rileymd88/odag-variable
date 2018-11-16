var qlik = window.require('qlik');
var config = {
	host: window.location.hostname,
	prefix: "/",
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
var baseUrl = (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "api/odag/v1";

export default function ($element, layout) {
    
    var app = qlik.currApp(this);
    var appId = app.id;

    /* $(`#odagVariable`).on('click', function () {
        getLinks(appId);
    }) */

    //$('#odagVariable').text(layout.prop.label);
    

    function selAppLinkUsages(linkId) {
        $.ajax({
            type: "POST",
            url: baseUrl + '/apps/' + appId + '/selAppLinkUsages',
            data: JSON.stringify({ linkList: linkId }),// now data come in this function
            contentType: "application/json",
            crossDomain: true,
            dataType: "json",
            success: function (data, status, jqXHR) {
                console.log('selAppLinkUsages', data);
            },
            error: function (jqXHR, status) {
                // error handler
                console.log(jqXHR);
                console.log('fail' + status);
            }
        });
    }


}