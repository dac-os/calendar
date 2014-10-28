var VError, router, nconf, slug, auth, Calendar, Event;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Calendar = require('../models/calendar');
Event = require('../models/event');
Activity = require('../models/activity');

/**
 * @api {post} /calendars/:calendar/events Creates a new calendar event.
 * @apiName createEvent
 * @apiVersion 1.0.0
 * @apiGroup event
 * @apiPermission changeEvent
 * @apiDescription
 * When creating a new calendar event the user must send the event name, date and description. The event name is used
 * for identifying and must be unique in the calendar. If a existing name is sent to this method, a 409 error will be
 * raised. And if no name or date is sent, a 400 error will be raised.
 *
 * @apiParam {Date} date Event date of occurrence.
 * @apiParam {String} name Event name.
 * @apiParam {String} [description] Event description.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "name": "required"
 *   "date": "required"
 * }
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 409 Conflict
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 201 Created
 * {}
 */
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