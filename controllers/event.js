var VError, router, nconf, slug, auth, Calendar, Event;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Calendar = require('../models/calendar');
Event = require('../models/event');

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
.route('/calendars/:calendar/events')
.post(auth.can('changeEvent'))
.post(function createEvent(request, response, next) {
  'use strict';

  var event;
  event = new Event({
    'slug'        : slug(request.param('name', '').toLowerCase()),
    'calendar'    : request.calendar ? request.calendar._id : null,
    'date'        : request.param('date'),
    'name'        : request.param('name'),
    'description' : request.param('description')
  });
  return event.save(function createdEvent(error) {
    if (error) {
      error = new VError(error, 'error creating event');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /calendars List all calendar events.
 * @apiName listEvent
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
.route('/calendars/:calendar/events')
.get(function listEvent(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Event.find();
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

/**
 * @api {get} /calendars/:calendar/events/:event Get event information.
 * @apiName getEvent
 * @apiVersion 1.0.0
 * @apiGroup event
 * @apiPermission none
 * @apiDescription
 * This method returns a single event details, the event slug must be passed in the uri to identify the requested event.
 * If no event with the requested slug was found, a 404 error will be raised.
 *
 * @apiSuccess {String} slug Event identifier.
 * @apiSuccess {Date} date Event date of occurrence.
 * @apiSuccess {String} name Event name.
 * @apiSuccess {String} [description] Event description.
 * @apiSuccess {Date} createdAt Event creation date.
 * @apiSuccess {Date} updatedAt Event last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "date": "2014-07-01T12:22:25.058Z",
 *   "slug": "inicio-matricula",
 *   "name": "início matricula",
 *   "description": "início do periodo de requerimento de matricula",
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/calendars/:calendar/events/:event')
.get(function getEvent(request, response) {
  'use strict';

  var event;
  event = request.event;
  return response.status(200).send(event);
});

/**
 * @api {put} /calendars/:calendar/events/:event Updates event information.
 * @apiName updateEvent
 * @apiVersion 1.0.0
 * @apiGroup event
 * @apiPermission changeEvent
 * @apiDescription
 * When updating a event the user must send the event date, name and description. If a existing name which is not the
 * original event name is sent to this method, a 409 error will be raised. And if no name or date is sent, a 400 error
 * will be raised. If no event with the requested slug was found, a 404 error will be raised.
 *
 * @apiParam {Date} date Event date of occurrence.
 * @apiParam {String} name Event name.
 * @apiParam {String} [description] Event description.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "year": "required"
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
 * HTTP/1.1 200 Ok
 * {}
 */
router
.route('/calendars/:calendar/events/:event')
.put(auth.can('changeEvent'))
.put(function updateEvent(request, response, next) {
  'use strict';

  var event;
  event = request.event;
  event.slug = slug(request.param('name', '').toLowerCase());
  event.date = request.param('date');
  event.name = request.param('name');
  event.description = request.param('description');
  return event.save(function updatedEvent(error) {
    if (error) {
      error = new VError(error, 'error updating event: "$s"', request.params.event);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /calendars/:calendar/events/:event Removes event.
 * @apiName removeEvent
 * @apiVersion 1.0.0
 * @apiGroup event
 * @apiPermission changeEvent
 * @apiDescription
 * This method removes a event from the system. If no event with the requested slug was found, a 404 error will be
 * raised.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 204 No Content
 * {}
 */
router
.route('/calendars/:calendar/events/:event')
.delete(auth.can('changeEvent'))
.delete(function removeEvent(request, response, next) {
  'use strict';

  var event;
  event = request.event;
  return event.remove(function removedEvent(error) {
    if (error) {
      error = new VError(error, 'error removing event: "$s"', request.params.event);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('calendar', function findCalendar(request, response, next, id) {
  'use strict';

  var query;
  query = Calendar.findOne();
  query.where('year').equals(isNaN(id) ? 0 : id);
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
      return response.status(404).end();
    }
    request.event = event;
    return next();
  });
});

module.exports = router;