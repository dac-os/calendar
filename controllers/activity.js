var VError, router, nconf,auth, Calendar;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
auth = require('dacos-auth-driver');
Activity = require('../models/activity');


router
.route('/events/:event/activities/:activity')
.post(auth.can('changeEvent'))
.post(function createEvent(request, response, next) {
  'use strict';

  var activity;
  activity = new Event({
    'slug'        : slug(request.param('name', '').toLowerCase()),
    'calendar'    : request.calendar ? request.calendar._id : null,
    'date'        : request.param('date'),
    'name'        : request.param('name'),
    'description' : request.param('description')
  });
  
  return activity.save(function createdEvent(error) {
    if (error) {
      error = new VError(error, 'error creating activity');
      return next(error);
    }
    return response.status(201).end();
  });
  
});