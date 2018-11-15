/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Delete post

describe('Delete post', () => {
	it('should delete the post', (done) => {
		chai.request(server)
			.delete('/api/post/' + postId)
			.set('token', userToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('Post has been deleted');
				done();
			});
	});

	it('should not find the comment', (done) => {
		chai.request(server)
			.get('/api/post/' + commentId)
			.set('token', userToken)
			.end((err, res) => {
				res.should.have.status(403);
				res.should.be.an('object');
				res.body.should.have.a.property('success').equal(false);
				res.body.should.have.a.property('message').equal('Post not found');
				done();
			});
	});
});
