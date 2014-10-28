/*globals describe, before, beforeEach, it, after*/
require('should');
var Activity;

Activity = require('../models/activity');

require('../index');

describe('activity models', function() {
	
	describe('save', function() {
		
		before(Activity.remove.bind(Activity));
		
		it('should create with code, name, reset, required', function(done) {
			var activity = new Activity({ 
				code:'1',
				name:'Inscricao aluno ee',
				reset:true,
				required:false
			});
			
			activity.save(function(error) {
				(error === null).should.be.true;
				done();
			});
		});
		
	});
	
	
	describe('save with previous', function() {
		
		var id;
		
		before(Activity.remove.bind(Activity));
		
		before(function(done) {
			var activity = new Activity({ 
				code:'1',
				name:'Inscricao aluno ee',
				reset:true,
				required:false
			});
			id = activity._id;
			activity.save(done);
		});
		
		
		it('should create with code, name, reset, required, previous', function(done) {
			
			var activity = new Activity({ 
				code:'2',
				name:'Aprovacao aluno ee',
				reset:true,
				required:false,
				previous: id
			});
			
			activity.save(function(error) {
				(error === null).should.be.true;
				done();
			});
		});
		
	});
	
	
});