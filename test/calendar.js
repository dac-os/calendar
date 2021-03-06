/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, Calendar;

supertest = require('supertest');
app = require('../index.js');
Calendar = require('../models/calendar');

describe('calendar controller', function () {
  'use strict';

  describe('create', function () {
    before(Calendar.remove.bind(Calendar));

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars');
        request.send({'year' : 2014});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeCalendar permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars');
        request.set('csrf-token', 'userToken');
        request.send({'year' : 2014});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials and year', function () {
      it('should create', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.expect(201);
        request.end(done);
      });
    });

    describe('with year taken', function () {
      before(Calendar.remove.bind(Calendar));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Calendar.remove.bind(Calendar));

    describe('with one in database', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.end(done);
      });

      it('should list 1 in first page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/calendars');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.be.instanceOf(Array).with.lengthOf(1);
          response.body.every(function (profile) {
            profile.should.have.property('year');
          });
        });
        request.end(done);
      });

      it('should return empty in second page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/calendars');
        request.send({'page' : 1});
        request.expect(200);
        request.expect(function (response) {
          response.body.should.be.instanceOf(Array).with.lengthOf(0);
        });
        request.end(done);
      });
    });
  });

  describe('details', function () {
    before(Calendar.remove.bind(Calendar));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.end(done);
    });

    describe('without valid slug', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/calendars/invalid');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid slug', function () {
      it('should show', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/calendars/2014');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal(2014);
        });
        request.end(done);
      });
    });
  });

  describe('update', function () {
    before(Calendar.remove.bind(Calendar));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/calendars/2014');
        request.send({'year' : 2015});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeCalendar permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/calendars/2014');
        request.set('csrf-token', 'userToken');
        request.send({'year' : 2015});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid slug', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/calendars/invalid');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/calendars/2014');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials and year', function () {
      it('should update', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/calendars/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.expect(200);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/calendars/2014');
        request.expect(404);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/calendars/2015');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal(2015);
        });
        request.end(done);
      });
    });

    describe('with name taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/calendars');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/calendars/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Calendar.remove.bind(Calendar));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/calendars');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/calendars/2014');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeCalendar permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/calendars/2014');
        request.set('csrf-token', 'userToken');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid slug', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/calendars/invalid');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid credentials and slug', function () {
      it('should delete', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/calendars/2014');
        request.set('csrf-token', 'adminToken');
        request.expect(204);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/calendars/2014');
        request.expect(404);
        request.end(done);
      });
    });
  });
});