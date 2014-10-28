/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, Calendar, Event;

supertest = require('supertest');
app = require('../index.js');
Calendar = require('../models/calendar');
Event = require('../models/event');
EventPeriod = require('../models/eventPeriod');

describe('event period controller', function () {
  'use strict';

  before(Calendar.remove.bind(Calendar));
  before(Event.remove.bind(Event));

  before(function (done) {
    var request;
    request = supertest(app);
    request = request.post('/calendars');
    request.set('csrf-token', 'adminToken');
    request.send({'year' : 2014});
    request.end(done);
  });

  before(function (done) {
    var request;
    request = supertest(app);
    request = request.post('/calendars/2014/events');
    request.set('csrf-token', 'adminToken');
    request.send({'date': new Date()});
    request.send({'name': 'Matricula'});
    request.send({'description':'Matricula em Disciplina'});
    request.end(done);
  });

  describe('create', function () {
    before(EventPeriod.remove.bind(EventPeriod));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/event-periods');
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.send({'event' : 'matricula'});
      request.expect(403);
      request.end(done);
    });

		it('should raise error without begin date', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/event-periods');
      request.set('csrf-token', 'userToken');
      request.send({'endDate' : new Date()});
      request.send({'event' : 'matricula'});
      request.expect(403);
      request.end(done);
    }); 

    it('should raise error without end date', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/event-periods');
      request.set('csrf-token', 'userToken');
      request.send({'beginDate' : new Date()});
      request.send({'event' : 'matricula'});
      request.expect(403);
      request.end(done);
    });   

		it('should raise error without event', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/event-periods');
      request.set('csrf-token', 'userToken');
      request.send({'endDate' : new Date()});
      request.send({'beginDate': new Date()});
      request.send({'event' : 'nonExistingOne'});
      request.expect(404);
      request.end(done);
    });

	});
});
