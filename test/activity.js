/*globals describe, before, beforeEach, it, after*/
require('should');
require('./index.js');
var supertest, app, Calendar, Event;

supertest = require('supertest');
app = require('../index.js');
Calendar = require('../models/calendar');
Event = require('../models/event');
Activity = require('../models/activity');

describe('activity controller', function () {
	
	'use strict';

	before(Calendar.remove.bind(Calendar));
	before(Event.remove.bind(Event));
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
		request = request.post('/events');
		request.set('csrf-token', 'adminToken')
		request.send({'name'        : 'Event1'});
		request.send({'description' : 'Event for test purposes'});
		request.end(done);
	});

	before(function (done) {
		var request = supertest(app);
		request = request.post('/events');
		request.set('csrf-token', 'adminToken')
		request.send({'name'        : 'Event2'});
		request.send({'description' : 'Event for test purposes'});
		request.end(done);
	});

	
	describe('create', function () {
		
		before(Activity.remove.bind(Activity));

		it('should raise error without token', function (done) {
	      var request = supertest(app);
	      request = request.post('/calendars/2014/events/event1/activities');
	      request.send({'code'     : '1'});
	      request.send({'name'     : 'Activity 1'});
	      request.send({'reset'    : 'false'});
	      request.send({'required' : 'false'});
	      request.expect(403);
	      request.end(done);
	    });
		
		it('should raise error event not found', function (done) {
	      var request = supertest(app);
	      request = request.post('/calendars/2014/events/event3/activities');
	      request.set('csrf-token', 'adminToken')
	      request.send({'code'     : '1'});
	      request.send({'name'     : 'Activity 1'});
	      request.send({'reset'    : 'false'});
	      request.send({'required' : 'false'});
	      request.expect(404);
	      request.end(done);
		});
		
		it('should raise error without cod', function (done) {
	      var request = supertest(app);
	      request = request.post('/calendars/2014/events/event1/activities');
	      request.set('csrf-token', 'adminToken')
	      request.send({'name'     : 'Activity 1'});
	      request.send({'reset'    : 'false'});
	      request.send({'required' : 'false'});
	      request.expect(400);
	      request.end(done);
		});
		
		it('should raise error without name', function (done) {
	      var request = supertest(app);
	      request = request.post('/calendars/2014/events/event1/activities');
	      request.set('csrf-token', 'adminToken')
	      request.send({'code'     : '1'});
	      request.send({'reset'    : 'false'});
	      request.send({'required' : 'false'});
	      request.expect(400);
	      request.end(done);
		});
		
		it('should raise error without reset', function (done) {
	      var request = supertest(app);
	      request = request.post('/calendars/2014/events/event1/activities');
	      request.set('csrf-token', 'adminToken')
	      request.send({'code'     : '1'});
	      request.send({'required' : 'false'});
	      request.expect(400);
	      request.end(done);
		});
		
		it('should raise error without required', function (done) {
	      var request = supertest(app);
	      request = request.post('/calendars/2014/events/event1/activities');
	      request.set('csrf-token', 'adminToken')
	      request.send({'code'     : '1'});
	      request.send({'name'     : 'Activity 1'});
	      request.send({'reset'    : 'false'});
	      request.expect(400);
	      request.end(done);
		});
		
		it('should create activity', function (done) {
	      var request = supertest(app);
	      request = request.post('/calendars/2014/events/event1/activities');
	      request.set('csrf-token', 'adminToken')
	      request.send({'code'     : '1'});
	      request.send({'name'     : 'Activity 1'});
	      request.send({'reset'    : 'false'});
	      request.send({'required' : 'false'});
	      request.expect(201);
	      request.end(done);
		});
	
	});
	
	
	describe('list', function () {
		
		before(Activity.remove.bind(Activity));
		
		before(function (done) {
			var request = supertest(app);
		    request = request.post('/calendars/2014/events/event1/activities');
		    request.set('csrf-token', 'adminToken')
		    request.send({'code'     : '1'});
		    request.send({'name'     : 'Activity 1'});
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
		    request.send({'name'     : 'Activity 2'});
		    request.send({'reset'    : 'false'});
		    request.send({'required' : 'false'});
		    request.expect(201);
		    request.end(done);
		});
		
		it('should list event activities', function (done) {
			var request = supertest(app);
		    request = request.get('/calendars/2014/events/event1/activities');
		    request.expect(200);
		    request.end(done);
		});
				
		
	});
	
});
