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
	before(ActivityPeriod.remove.bind(ActivityPeriod));

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
		request = request.post('/calendars/2014/event-periods');
		request.set('csrf-token', 'adminToken')
		request.send({'beginDate'   : new Date()});
		request.send({'endDate'     : new Date()});
		request.send({'event'       : 'event1'});
    request.expect(201);
		request.end(done);
	});

  before(function (done) {
		var request = supertest(app);
		request = request.post('/calendars/2014/events/event1/activities');
		request.set('csrf-token', 'adminToken')
		request.send({'code'     : '1'});
		request.send({'name'     : 'Activity1'});
		request.send({'reset'    : 'false'});
		request.send({'required' : 'false'});
    request.expect(201);
		request.end(done);
	});

	describe('create', function () {
		before(ActivityPeriod.remove.bind(ActivityPeriod));

		it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.send({'activity'  : 'activity1'});
			request.send({'beginDate' : new Date()});
			request.send({'endDate'   : new Date()});
      request.expect(403);
      request.end(done);
    });

		it('should create', function (done) {
			var request = supertest(app);
			request = request.post('/academic-periods/2014/event-periods/event1/activity-periods');
			request.set('csrf-token', 'adminToken');
			request.send({'activity'  : 'activity1'});
			request.send({'beginDate' : new Date()});
			request.send({'endDate'   : new Date()});
			request.expect(201);
			request.end(done);
		});		
	});
});
