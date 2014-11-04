var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'slug'        : {
    'type' : String
  },

  'name'        : {
    'type'     : String,
    'unique'   : true,
    'required' : true
  },
  'description' : {
    'type' : String
  },
  'createdAt'   : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt'   : {
    'type' : Date
  }
}, {
  'collection' : 'events',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'slug'     : 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'         : 0,
  'slug'        : 1,
  'name'        : 1,
  'description' : 1,
  'createdAt'   : 1,
  'updatedAt'   : 1
});

schema.pre('save', function setEventUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Event', schema);