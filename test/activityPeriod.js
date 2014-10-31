/*globals describe, before, beforeEach, it, after*/
require('should');
require('./index.js');
var supertest, app, Calendar, Event;

supertest = require('supertest');
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
		var request = supertest(app);
		request = request.post('/calendars');
		request.set('csrf-token', 'adminToken')
		request.send({'year' : 2014});
    request.expect(201);
		request.end(done);
	});

	before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars');
		request.set('csrf-token', 'adminToken')
		request.send({'year' : 2015});
    request.expect(201);
		request.end(done);
	});

	before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars/2014/events');
		request.set('csrf-token', 'adminToken')
		request.send({'date'         : new Date()});
		request.send({'name'        : 'Event1'});
		request.send({'description' : 'Event for test purposes'});
    request.expect(201);
		request.end(done);
	});

	before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars/2015/events');
		request.set('csrf-token', 'adminToken')
		request.send({'date'         : new Date()});
		request.send({'name'        : 'Event2'});
		request.send({'description' : 'Event for test purposes'});
    request.expect(201);
		request.end(done);
	});

	before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars/2014/event-periods');
		request.set('csrf-token', 'adminToken')
		request.send({'beginDate'   : new Date(2014,0,1)});
		request.send({'endDate'     : new Date(2014,5,30)});
		request.send({'event'       : 'event1'});
    request.expect(201);
		request.end(done);
	});

	before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars/2015/event-periods');
		request.set('csrf-token', 'adminToken')
		request.send({'beginDate'   : new Date(2015,0,1)});
		request.send({'endDate'     : new Date(2015,5,30)});
		request.send({'event'       : 'event2'});
    request.expect(201);
		request.end(done);
	});

  before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars/2014/events/event1/activities');
		request.set('csrf-token', 'adminToken')
		request.send({'code'     : '1'});
		request.send({'name'     : 'Activity1 1'});
		request.send({'reset'    : 'false'});
		request.send({'required' : 'false'});
    request.expect(201);
		request.end(done);
	});

	before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars/2014/events/event1/activities');
		request.set('csrf-token', 'adminToken')
		request.send({'code'     : '2'});
		request.send({'name'     : 'Activity1 2'});
		request.send({'reset'    : 'false'});
		request.send({'required' : 'false'});
    request.expect(201);
		request.end(done);
	});

	before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars/2015/events/event2/activities');
		request.set('csrf-token', 'adminToken')
		request.send({'code'     : '3'});
		request.send({'name'     : 'Activity2 1'});
		request.send({'reset'    : 'false'});
		request.send({'required' : 'false'});
    request.expect(201);
		request.end(done);
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
	
	describe('list', function () {

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
});
