# dacos-calendar v0.0.1

calendário do sistema da diretoria academica DAC

- [calendar](#calendar)
	- [Creates a new calendar.](#creates-a-new-calendar.)
	- [Get calendar information.](#get-calendar-information.)
	- [List all system calendars.](#list-all-system-calendars.)
	- [Removes calendar.](#removes-calendar.)
	- [Updates calendar information.](#updates-calendar-information.)
	
- [event](#event)
	- [Creates a new calendar event.](#creates-a-new-calendar-event.)
	- [Get event information.](#get-event-information.)
	- [List all calendar events.](#list-all-calendar-events.)
	- [Removes event.](#removes-event.)
	- [Updates event information.](#updates-event-information.)
	


# calendar

## Creates a new calendar.

When creating a new calendar the user must send the calendar year. The calendar year is used for identifying and must
be unique in the system. If a existing year is sent to this method, a 409 error will be raised. And if no year is
sent, a 400 error will be raised.

	POST /calendars

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| year			| Number			|  Calendar year.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "year": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get calendar information.

This method returns a single calendar details, the calendar year must be passed in the uri to identify the requested
calendar. If no calendar with the requested year was found, a 404 error will be raised.

	GET /calendars/:calendar


### Success Response

HTTP/1.1 200 OK

```
{
 "year": 2014,
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system calendars.

This method returns an array with all calendars in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /calendars

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "year": 2014,
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes calendar.

This method removes a calendar from the system. If no calendar with the requested year was found, a 404 error will be
raised.

	DELETE /calendars/:calendar


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates calendar information.

When updating a calendar the user must send the calendar year. If a existing year which is not the original calendar
year is sent to this method, a 409 error will be raised. And if no year is sent, a 400 error will be raised. If no
calendar with the requested year was found, a 404 error will be raised.

	PUT /calendars/:calendar

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| year			| Number			|  Calendar year.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "year": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
# event

## Creates a new calendar event.

When creating a new calendar event the user must send the event name, date and description. The event name is used
for identifying and must be unique in the calendar. If a existing name is sent to this method, a 409 error will be
raised. And if no name or date is sent, a 400 error will be raised.

	POST /calendars/:calendar/events

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| date			| Date			|  Event date of occurrence.							|
| name			| String			|  Event name.							|
| description			| String			| **optional** Event description.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "name": "required"
 "date": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get event information.

This method returns a single event details, the event slug must be passed in the uri to identify the requested event.
If no event with the requested slug was found, a 404 error will be raised.

	GET /calendars/:calendar/events/:event


### Success Response

HTTP/1.1 200 OK

```
{
 "date": "2014-07-01T12:22:25.058Z",
 "slug": "inicio-matricula",
 "name": "início matricula",
 "description": "início do periodo de requerimento de matricula",
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all calendar events.

This method returns an array with all events in the calendar. The data is returned in pages of length 20. If no page
is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /calendars

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "date": "2014-07-01T12:22:25.058Z",
 "slug": "inicio-matricula",
 "name": "início matricula",
 "description": "início do periodo de requerimento de matricula",
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes event.

This method removes a event from the system. If no event with the requested slug was found, a 404 error will be
raised.

	DELETE /calendars/:calendar/events/:event


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates event information.

When updating a event the user must send the event date, name and description. If a existing name which is not the
original event name is sent to this method, a 409 error will be raised. And if no name or date is sent, a 400 error
will be raised. If no event with the requested slug was found, a 404 error will be raised.

	PUT /calendars/:calendar/events/:event

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| date			| Date			|  Event date of occurrence.							|
| name			| String			|  Event name.							|
| description			| String			| **optional** Event description.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "year": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```

