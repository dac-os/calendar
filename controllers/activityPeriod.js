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

  if (request.param('activity') === undefined) {
    return response.status(400).json({activity : 'required'});
  }

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

function validateActivityPeriod(request, response, next) {
  'use strict';

  var beginDate = request.param('beginDate') === undefined ? 
    undefined : new Date(request.param('beginDate'));
  var endDate = request.param('endDate') == undefined ? 
    undefined : new Date(request.param('endDate'));
  var eventPeriod = request.eventPeriod;
  var errors = {empty : true, info  : {}};

  if (beginDate === undefined) {
    errors.info.beginDate = 'required';
    errors.empty = false;
  }

   if (endDate === undefined) {
    errors.info.endDate = 'required';
    errors.empty = false;
  }

  if (beginDate < eventPeriod.beginDate || beginDate > eventPeriod.endDate) {
    errors.info.beginDate = 'out of event period';
    errors.empty = false;
  }

  if (endDate < eventPeriod.beginDate || endDate > eventPeriod.endDate) {
    errors.info.endDate = 'out of event period';
    errors.empty = false;
  }

  if (beginDate > endDate) {
    errors.info.beginDate = 'before end date';
    errors.empty = false;
  }

  if (!errors.empty) {
    return response.status(400).json(errors.info);
  } else {
    return next();
  }
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
 * @apiParam {String} activity Slug for the activity that the activity period will refer to
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
.post(validateActivityPeriod)
.post(function createActivityPeriod(request, response, next) {
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

/**
 * @api {get} /academic-periods/:calendar/event-periods/:eventPeriod/activity-periods
 * @apiName getActivityPeriods
 * @apiVersion 1.0.0
 * @apiGroup event
 * @apiPermission changeActivityPeriod
 * @apiDescription
 * Get the list of activity periods associated to given academicperiods and event periods
 * 
 * @apiErrorExample
 * HTTP/1.1 404 Not found
 */
router
.route('/academic-periods/:calendar/event-periods/:eventPeriod/activity-periods')
.get(function getActivityPeriods(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = ActivityPeriod.find();
  query.where('eventPeriod').equals(request.eventPeriod._id);
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedEvent(error, activityPeriods) {
    if (error) {
      error = new VError(error, 'error finding activityPeriods');
      return next(error);
    }
    return response.status(200).send(activityPeriods);
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