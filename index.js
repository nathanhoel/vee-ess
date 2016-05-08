/*jslint node: true */
'use strict';

var app = require('./app'),
    port = process.env.PORT || 3000;

var server = app
	.listen(port)
	.on('listening', function () {
		var address = server.address();
		console.log('Vee-Ess Listenting, http://%s:%d', address.address, address.port);
	});
