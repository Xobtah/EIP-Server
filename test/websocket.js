/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../eip-server');
let should = chai.should();

let io = require('socket.io-client');

let socketURL = 'http://localhost:8080';

let options = {
    transports: [ 'websocket' ],
    'force new connection': true
};

describe('Websocket TEST', () => {
    let link_id = 'muskatnuss';
    let client1 = null;
    let client2 = null;

    it('should connect client1 to the server and receive the info', (done) => {
	client1 = io.connect(socketURL, options);

	client1.on('connect', (data) => {
	    (typeof data).should.be.equal('undefined');
	});

	client1.on('info', (data) => {
	    data.should.be.a('string').equal('You are connected to the server');
	    client1.removeListener('info');
	    done();
	});
    });

    it('should connect client1 to the server and receive the info', (done) => {
	client2 = io.connect(socketURL, options);

	client2.on('connect', (data) => {
	    (typeof data).should.be.equal('undefined');
	});

	client2.on('info', (data) => {
	    data.should.be.a('string').equal('You are connected to the server');
	    client2.removeListener('info');
	    done();
	});
    });

    it('should link the client1', (done) => {
	client1.on('info', (data) => {
	    data.should.be.equal('Linked with id \'' + link_id + '\'');
	    client1.removeListener('info');
	    done();
	});

	client1.emit('command', { link_id, body: { command: 'link', type: 'TESTER' } });
    });

    it('should link the client2', (done) => {
	client2.on('info', (data) => {
	    data.should.be.equal('Linked with id \'' + link_id + '\'');
	    client2.removeListener('info');
	    done();
	});

	client2.emit('command', { link_id, body: { command: 'link', type: 'TESTER' } });
    });

    it('should start the game', (done) => {
	client1.on('info', (data) => {
	    data.should.be.equal('Game started');
	    client1.removeListener('info');
	});
	client2.on('info', (data) => {
	    data.should.be.an('object');
	    data.should.have.a.property('link_id').to.be.equal(link_id);
	    data.should.have.a.property('body').to.have.a.property('command').to.be.equal('start_game');
	    client2.removeListener('info');
	    done();
	});

	client1.emit('command', { link_id, body: { command: 'start_game' } });
    });

    after(() => {
	client1.disconnect();
	client2.disconnect();
    });
});
