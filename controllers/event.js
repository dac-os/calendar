var VError, router, nconf, slug, auth, Calendar, Event;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Calendar = require('../models/calendar');
Event = require('../models/event');

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

router
.route('/calendars/:calendar/events/:event')
.get(function getEvent(request, response) {
  'use strict';

  var event;
  event = request.event;
  return response.status(200).send(event);
});

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
      return response.status(404).end();
    }
    request.event = event;
    return next();
  });
});

module.exports = router;