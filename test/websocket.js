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
	transports: ['websocket'],
	'force new connection': true
};

describe('Websocket TEST', () => {
	let link_id = 'muskatnuss';
	let client1 = null;
	let client2 = null;

	/*beforeEach((done) => {
		client1 = io.connect(socketURL, options);
        client1.on('connect', done);
    });

    afterEach(function(done) {
        if (socket.connected)
            socket.disconnect();
		else
            console.log('no connection to break...');
        done();
    });*/

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

	it('should connect client2 to the server and receive the info', (done) => {
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

		client1.emit('command', { type: 'client1', link_id, body: { command: 'link' } });
	});

	it('should link the client2', (done) => {
		client2.on('info', (data) => {
			data.should.be.equal('Linked with id \'' + link_id + '\'');
			client2.removeListener('info');
			done();
		});

		client2.emit('command', { type: 'client2', link_id, body: { command: 'link' } });
	});

	it('should start the game', (done) => {
		client1.on('test', () => {
			client2.removeListener('test');
			done();
		});

		/*client1.on('info', (data) => {
			data.should.be.equal('Game started');
			client1.removeListener('info');
		});*/
		
		client2.on('command', (data) => {
			data.should.be.an('object');
			data.should.have.a.property('link_id').to.be.equal(link_id);
			data.should.have.a.property('body').to.have.a.property('command').to.be.equal('start_game');
			client2.removeListener('info');
			client1.emit('test');
		});

		client1.emit('command', { type: 'client1', link_id, body: { command: 'start_game' } });
	});

	/*it('should end the game', (done) => {
		client1.on('info', (data) => {
			data.should.be.equal('Game ended');
			client1.removeListener('info');
			client2.on('command', (data) => {
				data.should.be.an('object');
				data.should.have.a.property('link_id').to.be.equal(link_id);
				data.should.have.a.property('body').to.have.a.property('command').to.be.equal('end_game');
				client2.removeListener('info');
				done();
			});
			client1.emit('command', { type: 'client1', link_id, body: { command: 'end_game' } });
		});
		client1.emit('command', { type: 'client1', link_id, body: { command: 'end_game' } });
	});

	it('shouldn\'t find the command', (done) => {
		client1.on('info', (data) => {
			data.should.be.equal('Game started');
			client1.removeListener('info');
			done();
		});

		client1.emit('command', { type: 'client1', link_id, body: { command: 'stop_game' } });
	});

	it('should receive data', (done) => {
		client2.on('data', (data) => {
			data.should.be.an('object');
			data.should.have.a.property('body').to.be.an('object').to.have.a.property('value').to.be.equal(42);
			done();
		});
		client1.emit('data', { type: 'client1', link_id, body: { value: 42 } });
	});*/

	after(() => {
		client1.disconnect();
		client2.disconnect();
	});
});
