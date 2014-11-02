/*globals describe, before, beforeEach, it, after*/
require('should');
require('./index.js');
var supertest, app, Calendar, Event;

supertest = require('supertest');
slug = require('slug');
async = require('async')
app = require('../index.js');
Calendar = require('../models/calendar');
Event = require('../models/event');
EventPeriod = require('../models/eventPeriod');
Activity = require('../models/activity');
ActivityPeriod = require('../models/activityPeriod');

describe('activity period controller', function () {
	'use strict';

	before(Calendar.remove.bind(Calendar));
	before(Event.remove.bind(Event));
	before(EventPeriod.remove.bind(EventPeriod));
	before(Activity.remove.bind(Activity));

	before(function (done) {
		var createdObjs = {};	
		
		async.waterfall([
			function(callback) {
				var calendar1 = new Calendar({
					'year' : 2014
				});
				createdObjs.calendar1 = calendar1;

				calendar1.save(function calendarCreated(error){
					return callback(error, createdObjs);
				});
			},
			function(createdObjs, callback) {
				var calendar2 = new Calendar({
					'year' : 2015
				});
				createdObjs.calendar2 = calendar2;

				calendar2.save(function calendarCreated(error){
					return callback(error, createdObjs);
				});
			},
			function(createdObjs, callback) {
				var event1 = new Event({
					'slug'        : 'event1',
					'calendar'    : createdObjs.calendar1._id,
					'date'        : new Date(),
					'name'        : 'Event1',
					'description' : 'Event for test purposes'
				});

				createdObjs.event1 = event1;

				event1.save(function eventCreated(error) {
					return callback(error, createdObjs);
				});
			},
			function(createdObjs, callback) {
				var event2 = new Event({
					'slug'        : 'event2',
					'calendar'    : createdObjs.calendar2._id,
					'date'        : new Date(),
					'name'        : 'Event2',
					'description' : 'Event for test purposes'
				});

				createdObjs.event2 = event2;

				event2.save(function eventCreated(error) {
					return callback(error, createdObjs);
				});
			},
			function(createdObjs, callback) {
				var eventPeriod1 = new EventPeriod({
					'slug'            : 'event1',
					'event'           : createdObjs.event1._id,
					'beginDate'       : new Date(2014,0,1),
					'endDate'         : new Date(2014,5,30),
					'calendar'        : createdObjs.calendar1._id
				});

				createdObjs.eventPeriod1 = eventPeriod1;

				eventPeriod1.save(function eventPeriodCreated(error) {
					return callback(error, createdObjs);
				});
			},
			function(createdObjs, callback) {
				var eventPeriod2 = new EventPeriod({
					'slug'            : 'event2',
					'event'           : createdObjs.event2._id,
					'beginDate'       : new Date(2015,0,1),
					'endDate'         : new Date(2015,5,30),
					'calendar'        : createdObjs.calendar2._id
				});

				createdObjs.eventPeriod2 = eventPeriod2;

				eventPeriod2.save(function eventPeriodCreated(error) {
					return callback(error, createdObjs);
				});
			},
			function(createdObjs, callback) {
				var activity1_1 = new Activity({
					'slug'            : 'activity1-1',
					'code'            : '1',
					'event'           : createdObjs.event1._id,
					'name'            : 'Activity1 1',
					'reset'           : false,
					'required'        : false
				});

				createdObjs.activity1_1 = activity1_1;

				activity1_1.save(function eventPeriodCreated(error) {
					return callback(error, createdObjs);
				});
			},
			function(createdObjs, callback) {
				var activity1_2 = new Activity({
					'slug'            : 'activity1-2',
					'code'            : '2',
					'event'           : createdObjs.event1._id,
					'name'            : 'Activity1 2',
					'reset'           : false,
					'required'        : false
				});

				createdObjs.activity1_2 = activity1_2;

				activity1_2.save(function eventPeriodCreated(error) {
					return callback(error, createdObjs);
				});
			},
			function(createdObjs, callback) {
				var activity2_1 = new Activity({
					'slug'            : 'activity2-1',
					'code'            : '3',
					'event'           : createdObjs.event2._id,
					'name'            : 'Activity2 1',
					'reset'           : false,
					'required'        : false
				});

				createdObjs.activity2_1 = activity2_1;

				activity2_1.save(function eventPeriodCreated(error) {
					return callback(error, createdObjs);
				});
			}
		],
		function(error) {
			if (error) throw error;

			return done();
		});
	});
	
	describe('create', function () {
		beforeEach(ActivityPeriod.remove.bind(ActivityPeriod));

		it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date()});
			request.send({'endDate'   : new Date()});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without activity', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'beginDate' : new Date()});
			request.send({'endDate'   : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('activity').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error activity not found', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activityNonExistent'});
			request.send({'beginDate' : new Date()});
			request.send({'endDate'   : new Date()});
      request.expect(404);
      request.end(done);
    });

    it('should raise error calendar not found', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods/2013/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date()});
			request.send({'endDate'   : new Date()});
      request.expect(404);
      request.end(done);
    });

    it('should raise error event period not found', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods/2014/event-periods/eventaaa/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date()});
			request.send({'endDate'   : new Date()});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without begin date', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'endDate'   : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('beginDate').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without end date', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate'   : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('endDate').be.equal('required');
      });
      request.end(done);
    });

		it('should raise error begin date before event period', function (done) {
			var request = supertest(app);
			request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date(2013,3,3)});
			request.send({'endDate'   : new Date(2014,3,5)});
			request.expect(400);
			request.expect(function (response) {
				response.body.should.have.property('beginDate').be.equal('out of event period');
			});
			request.end(done);
		});		

		it('should raise error end date after event period', function (done) {
			var request = supertest(app);
			request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date(2014,3,5)});
			request.send({'endDate'   : new Date(2015,3,9)});
			request.expect(400);
			request.expect(function (response) {
				response.body.should.have.property('endDate').be.equal('out of event period');
			});
			request.end(done);
		});

		it('should raise error begin date after event period', function (done) {
			var request = supertest(app);
			request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date(2015,3,4)});
			request.send({'endDate'   : new Date(2015,3,9)});
			request.expect(400);
			request.expect(function (response) {
				response.body.should.have.property('beginDate').be.equal('out of event period');
			});
			request.end(done);
		});

		it('should raise error end date before event period', function (done) {
			var request = supertest(app);
			request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date(2013,3,5)});
			request.send({'endDate'   : new Date(2013,3,9)});
			request.expect(400);
			request.expect(function (response) {
				response.body.should.have.property('endDate').be.equal('out of event period');
			});
			request.end(done);
		});

		it('should raise error begin date after end date', function (done) {
			var request = supertest(app);
			request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date(2014,3,10)});
			request.send({'endDate'   : new Date(2014,3,9)});
			request.expect(400);
			request.expect(function (response) {
				response.body.should.have.property('beginDate').be.equal('before end date')
			});
			request.end(done);
		});

		it('should create', function (done) {
			var request = supertest(app);
			request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1-1'});
			request.send({'beginDate' : new Date(2014,3,5)});
			request.send({'endDate'   : new Date(2014,3,9)});
			request.expect(201);
			request.end(done);
		});		
	});
	
	describe('find', function () {

		before(ActivityPeriod.remove.bind(ActivityPeriod));
		
		before(function (done) {
			var request = supertest(app);
					request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
					request.set('csrf-token', 'adminToken');
					request.send({'activity'  : 'activity1-1'});
					request.send({'beginDate' : new Date(2014,2,1)});
					request.send({'endDate'   : new Date(2014,3,1)});
					request.expect(201);
					request.end(done);
		});

		before(function (done) {
			var request = supertest(app);
					request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
					request.set('csrf-token', 'adminToken');
					request.send({'activity'  : 'activity1-2'});
					request.send({'beginDate' : new Date(2014,2,2)});
					request.send({'endDate'   : new Date(2014,3,2)});
					request.expect(201);
					request.end(done);
		});

		before(function (done) {
			var request = supertest(app);
					request = request.post('/academic-periods/2015/event-periods/event2/activity-periods');
					request.set('csrf-token', 'adminToken');
					request.send({'activity'  : 'activity2-1'});
					request.send({'beginDate' : new Date(2015,2,1)});
					request.send({'endDate'   : new Date(2015,3,1)});
					request.expect(201);
					request.end(done);
		});

		describe("all", function() {
			it('should raise error calendar not found', function (done) {
	      var request;
	      request = supertest(app);
	      request = request.get('/academic-periods/2013/event-periods/event1/activity-periods');
	      request.expect(404);
	      request.end(done);
	    });

	    it('should raise error event period not found', function (done) {
	      var request;
	      request = supertest(app);
	      request = request.get('/academic-periods/2014/event-periods/eventaaa/activity-periods');
	      request.expect(404);
	      request.end(done);
	    });

	    it('should list', function (done) {
	      var request;
	      request = supertest(app);
	      request = request.get('/academic-periods/2014/event-periods/event1/activity-periods');
	      request.expect(200);
	      request.expect(function (response) {
	        response.body.should.be.an.Array.with.lengthOf(2);
	        response.body.every(function (event) {
	          event.should.have.property('beginDate');
	          event.should.have.property('endDate');
	          event.should.have.property('slug');
	          event.should.not.have.property('eventPeriod');
	          event.should.not.have.property("activity");
	        });
	      });
	      request.end(done);
	    });
		});
		
		describe('by id', function() {
			it('should raise error calendar not found', function (done) {
	      var request;
	      request = supertest(app);
	      request = request.get('/academic-periods/2013/event-periods/event1/activity-periods/activity1-1');
	      request.expect(404);
	      request.end(done);
	    });

	    it('should raise error event period not found', function (done) {
	      var request;
	      request = supertest(app);
	      request = request.get('/academic-periods/2014/event-periods/eventaaa/activity-periods/activity1-1');
	      request.expect(404);
	      request.end(done);
	    });

	    it('should raise error activity period not found', function (done) {
	      var request;
	      request = supertest(app);
	      request = request.get('/academic-periods/2014/event-periods/event1/activity-periods/activity5-1');
	      request.expect(404);
	      request.end(done);
	    });

	    it('should find', function (done) {
	      var request;
	      request = supertest(app);
	      request = request.get('/academic-periods/2014/event-periods/event1/activity-periods/activity1-1');
	      request.expect(200);
	      request.expect(function(response) {
	      	response.body.should.be.an.instanceOf(Object);
	      	response.body.should.have.property('slug', 'activity1-1');
	      	response.body.should.have.property('beginDate');
	      	response.body.should.have.property('endDate');

	      });
	      request.end(done);
	    });
		});		
	});
});
