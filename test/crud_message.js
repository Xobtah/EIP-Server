/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Create message

let notTheLastMessageId = null;
let lastMessageId = null;

describe('Create message', () => {
    it('should not send message as it is missing a field', (done) => {
        chai.request(server)
            .post('/api/message')
            .set('token', userToken)
            .send({ to: goodUser2._id })
            .end((err, res) => {
                res.should.have.status(403);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('message').to.be.equal("Missing key 'content' in body");
                done();
            });
    });

    it('should not send message to herself', (done) => {
        chai.request(server)
            .post('/api/message')
            .set('token', userToken)
            .send({ content: 'introvertion', to: goodUser._id })
            .end((err, res) => {
                res.should.have.status(403);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('message').to.be.equal('You cannot send a message to yourself');
                done();
            });
    });

    it('should not send message as it is empty', (done) => {
        chai.request(server)
            .post('/api/message')
            .set('token', userToken)
            .send({ content: '', to: goodUser2._id })
            .end((err, res) => {
                res.should.have.status(403);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                //res.body.should.have.a.property('message').to.be.equal('Cannot save an empty message');
                done();
            });
    });

    it('should send message from u1 to u2', (done) => {
        chai.request(server)
            .post('/api/message')
            .set('token', userToken)
            .send({ content: '...', to: goodUser2._id })
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('message').to.be.equal('Message sent');
                done();
            });
    });

    it('should get the message as u1', (done) => {
        chai.request(server)
            .get('/api/message')
            .set('token', userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('data').to.be.an('array');
                res.body.data.length.should.be.equal(1);
                res.body.data[0].should.be.an('object');
                res.body.data[0].should.have.a.property('author').to.be.equal(goodUser._id);
                res.body.data[0].should.have.a.property('to').to.be.equal(goodUser2._id);
                res.body.data[0].should.have.a.property('content').to.be.equal('...');
                notTheLastMessageId = res.body._id;
                done();
            });
    });

    it('should get the message as u2', (done) => {
        chai.request(server)
            .get('/api/message')
            .set('token', userToken2)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('data').to.be.an('array');
                res.body.data.length.should.be.equal(1);
                res.body.data[0].should.be.an('object');
                res.body.data[0].should.have.a.property('author').to.be.equal(goodUser._id);
                res.body.data[0].should.have.a.property('to').to.be.equal(goodUser2._id);
                res.body.data[0].should.have.a.property('content').to.be.equal('...');
                done();
            });
    });

    it('should send a message from u2 to u1', (done) => {
        chai.request(server)
            .post('/api/message')
            .set('token', userToken2)
            .send({ content: 'What?', to: goodUser._id })
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('message').to.be.equal('Message sent');
                done();
            });
    });

    it('should get the last message as u1', (done) => {
        chai.request(server)
            .get('/api/message/last/' + notTheLastMessageId)
            .set('token', userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('data').to.be.an('array');
                res.body.data.length.should.be.equal(1);
                res.body.data[0].should.be.an('object');
                res.body.data[0].should.have.a.property('author').to.be.equal(goodUser2._id);
                res.body.data[0].should.have.a.property('to').to.be.equal(goodUser._id);
                res.body.data[0].should.have.a.property('content').to.be.equal('What?');
                lastMessageId = res.body._id;
                done();
            });
    });

    it('should get message by id', (done) => {
        chai.request(server)
            .get('/api/message/' + lastMessageId)
            .set('token', userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('data').to.be.an('object');
                res.body.data.should.have.a.property('author').to.be.equal(goodUser2._id);
                res.body.data.should.have.a.property('to').to.be.equal(goodUser._id);
                res.body.data.should.have.a.property('content').to.be.equal('What?');
                lastMessageId = res.body._id;
                done();
            });
    });

    it('should not delete the message as it is not u1s', (done) => {
        chai.request(server)
            .delete('/api/message/' + lastMessageId)
            .set('token', userToken)
            .end((err, res) => {
                res.should.have.status(403);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('message').to.be.equal('You cannot delete a message that is not yours');
                done();
            });
    });

    it('should delete u1s message', (done) => {
        chai.request(server)
            .delete('/api/message/' + notTheLastMessageId)
            .set('token', userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('message').to.be.equal('Message deleted');
                done();
            });
    });

    it('should delete u2s message', (done) => {
        chai.request(server)
            .delete('/api/message/' + lastMessageId)
            .set('token', userToken2)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.should.have.a.property('body').to.be.an('object');
                res.body.should.have.a.property('message').to.be.equal('Message deleted');
                done();
            });
    });
});
