/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../eip-server');
let should = chai.should();

let io = require('socket.io-client');

let socketURL = 'http://0.0.0.0:5000';

let options = {
    transports: [ 'websocket' ],
    'force new connection': true
};

describe('Websocket TEST', () => {
    it('should connect to the server and receive the info', (done) => {
	let client = io.connect(socketURL, options);

	client.on('info', (data) => {
	    data.should.be.a('string').equal('You are connected to the server');
	    client.disconnect();
	    done();
	});

	client.on('connect', (data) => {
	    console.log('Connected');
	});
    });
});
