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
.post(auth.can('changeActivity'))
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
  
  return activity.save(function createdActivity(error) {
    if (error) {
      error = new VError(error, 'error creating activity');
      return next(error);
    }
    return response.status(201).end();
  });
});


/**
 * @api {get} /events/:event/activities List all calendar events.
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
.route('/events/:event/activities')
.get(function listActivities(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Activity.find();
  query.where('event').equals(request.event._id);
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedActivities(error, activities) {
    if (error) {
      error = new VError(error, 'error finding activities');
      return next(error);
    }
    return response.status(200).send(activities);
  });
});


router
.route('/calendars/:calendar/events/:event/activities')
.get(function listActivities(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Activity.find();
  query.where('event').equals(request.event._id);
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedActivities(error, activities) {
    if (error) {
      error = new VError(error, 'error finding activities');
      return next(error);
    }
    console.log(activities);
    return response.status(200).send(activities);
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
.route('/events/:event/activities/:activity')
.get(function getActivity(request, response) {
  'use strict';

  var activity;
  activity = request.activity;
  return response.status(200).send(activity);
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
.route('/events/:event/activities/:activity')
.put(auth.can('changeActivity'))
.put(function updateActivity(request, response, next) {
	
  'use strict';

  var activity;
  activity = request.activity;
  activity.slug = slug(request.param('slug', '').toLowerCase());
  activity.code = request.param('code');
  activity.event = request.param('event');
  activity.name = request.param('name');
  activity.reset = request.param('reset');
  activity.required = request.param('required');
  activity.previous = request.param('previous');
  activity.next = request.param('next');
  
  return event.save(function updatedActivity(error) {
    if (error) {
      error = new VError(error, 'error updating activity: "$s"', request.params.activity);
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
.route('/events/:event/activities/:activity')
.delete(auth.can('changeActivity'))
.delete(function removeActivity(request, response, next) {
  'use strict';

  var activity;
  activity = request.activity;
  return activity.remove(function removedActivity(error) {
    if (error) {
      error = new VError(error, 'error removing activity: "$s"', request.params.activity);
      return next(error);
    }
    return response.status(204).end();
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


router.param('activity', function findActivity(request, response, next, id) {
  'use strict';

  var query;
  query = Activity.findOne();
  query.where('event').equals(request.event._id)
  query.where('slug').equals(id);
  query.exec(function foundActivity(error, activity) {
    if (error) {
      error = new VError(error, 'error finding activity: "$s"', activity);
      return next(error);
    }
    if (!activity) {
      return response.status(404).end();
    }
    request.activity = activity;
    return next();
  });
});

module.exports = router;
