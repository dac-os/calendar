var VError, router, nconf, slug, auth, Calendar, Event;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Calendar = require('../models/calendar');
Event = require('../models/event');
Activity = require('../models/activity');

router
.route('/calendars/:calendar/events/:event/activities')
.post(auth.can('changeActivity'))
.post(function createActivity(request, response, next) {
  'use strict';

  var activity;
  activity = new Activity({
    'slug'        : slug(request.param('name', '').toLowerCase()),
    'event'       : request.event._id,
    'code'        : request.param('code'),
    'name'        : request.param('name'),
    'reset'       : request.param('reset'),
    'required'    : request.param('required')
  });
  return activity.save(function createdActivity(error) {
    if (error) {
      error = new VError(error, 'error creating activity');
      return next(error);
    }
    return response.status(201).end();
  });
});

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

router.param('calendar', function findCalendar(request, response, next, id) {
  'use strict';

  var query;
  query = Calendar.findOne();
  query.where('year').equals(id);
  query.exec(function foundCalendar(error, calendar) {
    if (error) {
      error = new VError(error, 'error finding calendar: "$s"', calendar);
      return next(error);
    }
    if (!calendar) {
      return response.status(404).end();
    }
    request.calendar = calendar;
    return next();
  });
});

router.param('event', function findEvent(request, response, next, id) {
  'use strict';

  var query;
  query = Event.findOne();
  query.where('calendar').equals(request.calendar._id);
  query.where('slug').equals(id);
  query.exec(function foundEvent(error, event) {
    if (error) {
      error = new VError(error, 'error finding event: "$s"', event);
      return next(error);
    }
    if (!event) {
      console.log("Event %s not found for Activity route.", id);
      return response.status(404).end();
    }
    request.event = event;
    return next(); 
  });
 });

module.exports = router;
