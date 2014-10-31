/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, AcademicPeriod;

supertest = require('supertest');
app = require('../index.js');
AcademicPeriod = require('../models/academicPeriod');

describe('academic period controller', function () {
  'use strict';

  describe('create', function () {
    before(AcademicPeriod.remove.bind(AcademicPeriod));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeAcademicPeriod permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'userToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without periodNumber', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('periodNumber').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without periodType', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('periodType').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without year', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without beginDate', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'endDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('beginDate').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without endDate', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('endDate').be.equal('required');
      });
      request.end(done);
    });

    it('should create', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(201);
      request.end(done);
    });

    describe('with periodNumber, periodType and year taken', function () {
      before(AcademicPeriod.remove.bind(AcademicPeriod));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/academic-periods');
        request.set('csrf-token', 'adminToken');
        request.send({'periodNumber' : 1});
        request.send({'periodType' : 'S'});
        request.send({'year' : 2014});
        request.send({'beginDate' : new Date()});
        request.send({'endDate' : new Date()});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/academic-periods');
        request.set('csrf-token', 'adminToken');
        request.send({'periodNumber' : 1});
        request.send({'periodType' : 'S'});
        request.send({'year' : 2014});
        request.send({'beginDate' : new Date()});
        request.send({'endDate' : new Date()});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(AcademicPeriod.remove.bind(AcademicPeriod));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.end(done);
    });

    it('should list', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/academic-periods');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(1);
        response.body.every(function (profile) {
          profile.should.have.property('slug');
          profile.should.have.property('periodNumber');
          profile.should.have.property('periodType');
          profile.should.have.property('year');
          profile.should.have.property('beginDate');
          profile.should.have.property('endDate');
        });
      });
      request.end(done);
    });

    it('should return empty in second page', function (done) {
      var request;

      request = supertest(app);
      request = request.get('/academic-periods');
      request.send({'page' : 1});
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(0);
      });
      request.end(done);
    });
  });

  describe('details', function () {
    before(AcademicPeriod.remove.bind(AcademicPeriod));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.end(done);
    });

    it('should raise error with invalid slug', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/academic-periods/2S2010');
      request.expect(404);
      request.end(done);
    });

    it('should show', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/academic-periods/1S2014');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('slug').be.equal('1S2014');
        response.body.should.have.property('periodNumber').be.equal(1);
        response.body.should.have.property('periodType').be.equal('S');
        response.body.should.have.property('year').be.equal(2014);
        response.body.should.have.property('beginDate');
        response.body.should.have.property('endDate');
      });
      request.end(done);
    });
  });

  describe('update', function () {
    before(AcademicPeriod.remove.bind(AcademicPeriod));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-periods/1S2014');
      request.send({'periodNumber' : 5});
      request.send({'periodType' : 'A'});
      request.send({'year' : 2015});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeAcademicPeriod permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-periods/1S2014');
      request.set('csrf-token', 'userToken');
      request.send({'periodNumber' : 5});
      request.send({'periodType' : 'A'});
      request.send({'year' : 2015});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid slug', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-period/1S2010');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 5});
      request.send({'periodType' : 'A'});
      request.send({'year' : 2015});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without periodNumber', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-periods/1S2014');
      request.set('csrf-token', 'adminToken');
      request.send({'periodType' : 'A'});
      request.send({'year' : 2015});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('periodNumber').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without periodType', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-periods/1S2014');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 5});
      request.send({'year' : 2015});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('periodType').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without year', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-periods/1S2014');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 5});
      request.send({'periodType' : 'A'});
      request.send({'beginDate' : new Date()});
      request.send({'endDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('year').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without beginDate', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-periods/1S2014');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 5});
      request.send({'periodType' : 'A'});
      request.send({'year' : 2015});
      request.send({'endDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('beginDate').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without endDate', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-periods/1S2014');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 5});
      request.send({'periodType' : 'A'});
      request.send({'year' : 2015});
      request.send({'beginDate' : new Date()});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('endDate').be.equal('required');
      });
      request.end(done);
    });

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/academic-periods/1S2014');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 5});
      request.send({'periodType' : 'A'});
      request.send({'year' : 2015});
      request.send({'endDate' : new Date()});
      request.send({'beginDate' : new Date()});
      request.expect(200);
      request.end(done);
    });

    describe('with slug taken', function () {

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/academic-periods');
        request.set('csrf-token', 'adminToken');
        request.send({'periodNumber' : 1});
        request.send({'periodType' : 'S'});
        request.send({'year' : 2014});
        request.send({'endDate' : new Date()});
        request.send({'beginDate' : new Date()});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/academic-periods/1S2014');
        request.set('csrf-token', 'adminToken');
        request.send({'periodNumber' : 5});
        request.send({'periodType' : 'A'});
        request.send({'year' : 2015});
        request.send({'endDate' : new Date()});
        request.send({'beginDate' : new Date()});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(AcademicPeriod.remove.bind(AcademicPeriod));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/academic-periods');
      request.set('csrf-token', 'adminToken');
      request.send({'periodNumber' : 1});
      request.send({'periodType' : 'S'});
      request.send({'year' : 2014});
      request.send({'endDate' : new Date()});
      request.send({'beginDate' : new Date()});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/academic-periods/1S2014');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeAcademicPeriod permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/academic-periods/1S2014');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid slug', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/academic-periods/1S2010');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/academic-periods/1S2014');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});