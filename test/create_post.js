/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Create post

describe('Create post', () => {
	it('shouldn\'t create a new post, missing field content', (done) => {
		chai.request(server)
			.post('/api/post')
			.set('token', userToken)
			.send({})
			.end((err, res) => {
				res.should.have.status(403);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal("Missing key 'content' in body");
				done();
			});
	});

	it('should create a new post', (done) => {
		chai.request(server)
			.post('/api/post')
			.set('token', userToken)
			.send({ content: 'Do you guys know where is the cake?' })
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('data').to.be.an('object');
				res.body.should.have.a.property('message').equal('Post has been inserted');
				res.body.data.should.have.a.property('_id');
				postId = res.body.data._id;
				done();
			});
	});

	it('should comment on the post', (done) => {
		chai.request(server)
			.post('/api/post')
			.set('token', userToken)
			.send({ content: 'No', parent: postId })
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('data').to.be.an('object');
				res.body.should.have.a.property('message').equal('Post has been inserted');
				res.body.data.should.have.a.property('_id');
				commentId = res.body.data._id;
				done();
			});
	});
});
