var VError, router, nconf, slug, auth, Calendar, Event;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
ActivityPeriod = require('../models/activityPeriod');
EventPeriod = require('../models/eventPeriod');
Activity = require('../models/activity');
Calendar = require('../models/calendar');

function findActivity(request, response, next) {
  'use strict';

  var query;
  query = Activity.findOne();
  query.where('slug').equals(request.param('activity'));
  query.where('event').equals(request.eventPeriod.event);
  query.exec(function foundEvent(error, activity) {
    if (error) {
      error = new VError(error, 'error finding activity: "$s"', activity);
      return next(error);
    }
    if (!activity) {
      console.log("Activity %s not found for event " + request.eventPeriod.slug + ". Event OID: " + request.eventPeriod.event, request.param('activity'));
      return response.status(404).end();
    }
    request.activity = activity;
    return next();
  });
}

/**
 * @api {post} /academic-periods/:calendar/event-periods/:eventPeriod/activity-periods
 * @apiName createActivityPeriod
 * @apiVersion 1.0.0
 * @apiGroup event
 * @apiPermission changeActivityPeriod
 * @apiDescription
 * Creates a new activity event.
 * 
 * @apiParam {String} activity Slug for the activity that the activity period will reffer to
 * @apiParam {Date}   beginDate Event begin date of occurrence.
 * @apiParam {Date}   endDate Event end date of occurrence.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "activity": "required"
 *   "beginDate": "required"
 *   "endDate": "required"
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
.route('/academic-periods/:calendar/event-periods/:eventPeriod/activity-periods')
.post(auth.can('changeActivityPeriod'))
.post(findActivity)
.post(function createEvent(request, response, next) {
  'use strict';

  var activityPeriod;
  activityPeriod = new ActivityPeriod({
    'slug'				: request.activity.slug,
    'activity'    : request.activity,
    'eventPeriod' : request.eventPeriod,
    'beginDate'   : request.param('beginDate'),
    'endDate'	    : request.param('endDate')
  });
  return activityPeriod.save(function createdEvent(error) {
    if (error) {
      error = new VError(error, 'error creating activity period');
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
      console.error('Calendar with year %s not found', id);
      return response.status(404).end();
    }
    request.calendar = calendar;
    return next();
  });
});

router.param('eventPeriod', function findCalendar(request, response, next, id) {
  'use strict';

  var query;
  query = EventPeriod.findOne();
  query.where('slug').equals(id);
  query.where('calendar').equals(request.calendar._id); 
  query.exec(function foundCalendar(error, eventPeriod) {
    if (error) {
      error = new VError(error, 'error finding eventPeriod: "$s"', eventPeriod);
      return next(error);
    }
    if (!eventPeriod) {
      console.error('Event period with slug %s not found', id);
      return response.status(404).end();
    }
    request.eventPeriod = eventPeriod;
    return next();
  });
});

module.exports = router;