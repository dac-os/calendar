/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, Calendar, Event;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
Calendar = require('../models/calendar');
Event = require('../models/event');

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'adminToken'}
}).get('/users/me').times(Infinity).reply(200, {
  'academicRegistry' : '111111',
  'profile'          : {
    'name'        : 'admin',
    'slug'        : 'admin',
    'permissions' : ['changeCalendar', 'changeEvent']
  }
});

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'userToken'}
}).get('/users/me').times(Infinity).reply(200, {
  'academicRegistry' : '111112',
  'profile'          : {
    'name'        : 'user',
    'slug'        : 'user',
    'permissions' : []
  }
});

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'undefined'}
}).get('/users/me').times(Infinity).reply(404, {});

describe('event controller', function () {
  'use strict';

  before(Calendar.remove.bind(Calendar));

  before(function (done) {
    var request;
    request = supertest(app);
    request = request.post('/calendars');
    request.set('csrf-token', 'adminToken');
    request.send({'year' : 2014});
    request.end(done);
  });

  describe('create', function () {
    before(Event.remove.bind(Event));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeEvent permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'userToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without valid calendar', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2015/events');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without name', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without date', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'matricula do primeiro semestre'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('date').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name and date', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('date').be.equal('required');
      });
      request.end(done);
    });

    it('should create', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre'});
      request.expect(201);
      request.end(done);
    });

    describe('with name taken', function () {
      before(Event.remove.bind(Event));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars/2014/events');
        request.set('csrf-token', 'adminToken');
        request.send({'date' : new Date()});
        request.send({'name' : 'matricula do primeiro semestre'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars/2014/events');
        request.set('csrf-token', 'adminToken');
        request.send({'date' : new Date()});
        request.send({'name' : 'matricula do primeiro semestre'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Event.remove.bind(Event));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre'});
      request.end(done);
    });

    it('should raise error without valid calendar', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/calendars/2015/events');
      request.expect(404);
      request.end(done);
    });

    it('should list', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/calendars/2014/events');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(1);
        response.body.every(function (event) {
          event.should.have.property('date');
          event.should.have.property('name');
          event.should.have.property('slug');
        });
      });
      request.end(done);
    });

    it('should return empty in second page', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/calendars/2014/events');
      request.send({'page' : 1});
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(0);
      });
      request.end(done);
    });
  });

  describe('details', function () {
    before(Event.remove.bind(Event));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre'});
      request.end(done);
    });

    it('should raise error without valid calendar', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/calendars/2015/events/matricula-do-primeiro-semestre');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid slug', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/calendars/2014/events/invalid');
      request.expect(404);
      request.end(done);
    });

    it('should show', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('slug').be.equal('matricula-do-primeiro-semestre');
        response.body.should.have.property('name').be.equal('matricula do primeiro semestre');
        response.body.should.have.property('date');
      });
      request.end(done);
    });
  });

  describe('update', function () {
    before(Event.remove.bind(Event));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre 2'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeEvent permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'userToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre 2'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without valid calendar', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/calendars/2015/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre 2'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid slug', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/calendars/2014/events/invalid');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre 2'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without name', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without date', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'matricula do primeiro semestre 2'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('date').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name and date', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('date').be.equal('required');
      });
      request.end(done);
    });

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre 2'});
      request.expect(200);
      request.end(done);
    });

    describe('with name taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars/2014/events');
        request.set('csrf-token', 'adminToken');
        request.send({'date' : new Date()});
        request.send({'name' : 'matricula do primeiro semestre'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/calendars/2014/events/matricula-do-primeiro-semestre');
        request.set('csrf-token', 'adminToken');
        request.send({'date' : new Date()});
        request.send({'name' : 'matricula do primeiro semestre 2'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Event.remove.bind(Event));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars/2014/events');
      request.set('csrf-token', 'adminToken');
      request.send({'date' : new Date()});
      request.send({'name' : 'matricula do primeiro semestre'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeEvent permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without valid calendar', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/calendars/2015/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid slug', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/calendars/2014/events/invalid');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/calendars/2014/events/matricula-do-primeiro-semestre');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});