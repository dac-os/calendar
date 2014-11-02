var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
Schema = mongoose.Schema;

schema = new Schema ({
	'slug'       : {
		'type'     : String,
		'required' : true
	},
	'activity'		: {
		'type'     : Schema.ObjectId,
		'ref'      : 'Activity',
		'required' : true
	},
	'eventPeriod'	: {
		'type'     : Schema.ObjectId,
		'ref'      : 'EventPeriod',
		'required' : true
	},
	'beginDate': {
		'type'     : Date,
		'required' : true
	},
	'endDate' : {
		'type'     : Date,
		'required' : true
	}
}, {
	'collection' : 'activityPeriods',
	'strict'     : true,
	'toJSON'     : {
		'virtuals' : true
	}
});

schema.index({
	'activity'    : 1,
	'eventPeriod' : 1
}, {
	'unique' : true
})

schema.index({
	'slug'    : 1,
	'eventPeriod' : 1
}, {
	'unique' : true
})

schema.plugin(jsonSelect, {
	'_id'           : 0,
	'slug'					: 1,
	'eventPeriod'   : 0,
	'beginDate'     : 1,
	'endDate'       : 1,
	'activity'      : 0
});

module.exports = mongoose.model('ActivityPeriod', schema);
