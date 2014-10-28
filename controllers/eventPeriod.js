var VError, router, nconf, slug, auth, Calendar, Event;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Calendar = require('../models/calendar');
Event = require('../models/event');
EventPeriod = require('../models/eventPeriod');

router.use(function findEvent(request, response, next) {
  'use strict';

  if (!request.param('event')) {
    return next();
  }
  
  var query;
  
  query = Event.findOne();
  query.where('slug').equals(request.param('event'));
  query.exec(function foundEvent(error, event) {
    if (error) {
      error = new VError(error, 'error finding event: "$s"', event);
      return next(error);
    }
    if (!event) {
      return response.status(404).end();
    }
    request.event = event;
    return next();
  });
});

/**
 * @api {post} /calendars/:calendar/eventPeriods Creates a new calendar event period.
 * @apiName createEvent
 * @apiVersion 1.0.0
 * @apiGroup event
 * @apiPermission changeEventPeriod
 * @apiDescription
 * When creating a new calendar event period the user must send the begin date and end date. 
 *
 * @apiParam {Date} beginDate Event begin date of occurrence.
 * @apiParam {Date} endDate Event end date of occurrence.
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
.route('/calendars/:calendar/event-periods')
.post(auth.can('changeEventPeriod'))
.post(function createEvent(request, response, next) {
  'use strict';

  var eventPeriod;
  eventPeriod = new EventPeriod({
    'calendar'    : request.calendar ? request.calendar._id : null,
    'slug'        : request.event.slug,
    'beginDate'   : request.param('beginDate'),
    'endDate'	    : request.param('endDate'),
    'event' 	    : request.event ? request.event._id : null
  });
  return eventPeriod.save(function createdEvent(error) {
    if (error) {
      error = new VError(error, 'error creating event period');
      return next(error);
    }
    return response.status(201).end();
  });
});


/**
 * @api {get} /calendars List all calendar event periods.
 * @apiName listEventPeriods
 * @apiVersion 1.0.0
 * @apiGroup event
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all events in the calendar. The data is returned in pages of length 20. If no page
 * is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (event) {String} slug Event identifier.
 * @apiSuccess (event) {Date} date Event date of occurrence.
 * @apiSuccess (event) {String} name Event name.
 * @apiSuccess (event) {String} [description] Event description.
 * @apiSuccess (event) {Date} createdAt Event creation date.
 * @apiSuccess (event) {Date} updatedAt Event last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "date": "2014-07-01T12:22:25.058Z",
 *   "slug": "inicio-matricula",
 *   "name": "início matricula",
 *   "description": "início do periodo de requerimento de matricula",
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/calendars/:calendar/event-periods')
.get(function listEventPeriods(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = EventPeriod.find();
  query.where('calendar').equals(request.calendar._id);
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedEvent(error, events) {
    if (error) {
      error = new VError(error, 'error finding events');
      return next(error);
    }
    return response.status(200).send(events);
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

module.exports = router;