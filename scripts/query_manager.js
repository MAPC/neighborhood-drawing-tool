var _ = require('lodash')
  , api_base = 'http://localhost:2474/'
  , geo_base = 'http://localhost:2474/geographic/spatial/'
  , jqXHR

var get_site = function() { return api_base }


var topics   = function (callback) {
  request({ resource: 'topics'
          , callback: callback })
}


var tables = function (topic, callback) {
  if ( undefined_or_empty( topic ) ) { 
    throw new Error('No topic defined for #tables().') }
  
  request({ resource: 'topics'
          , specify:   topic.toLowerCase()
          , callback:  callback            })
}


var fields = function (table, callback) {
  if ( undefined_or_empty( table ) ) { 
    throw new Error('No table defined for #fields().') }
  
  request({ resource: 'tables'
          , specify:   table.toLowerCase() + '/fields'
          , callback:  callback            })
}


var geographies = function (table, callback) {
  if ( undefined_or_empty( table ) ) { 
    throw new Error('No table defined for #geographies().') }
  
  request({ resource: 'tables'
          , specify:   table.toLowerCase() + '/geographies'
          , callback:  callback            })
}


var undefined_or_empty = function (thing) {
  if (thing == undefined || thing.length == 0 || jQuery.isEmptyObject(thing)) {
    return true  }
  else {
    return false }
}


var geo_query = function ( args, polygon, callback ) {
  var url = geo_base + args.geography + '/tabular/' + args.table + '/' + args.field + '/intersect'
    , polygon = polygon.geometry

  console.log(url)

  if (jqXHR && jqXHR.readyState != 4){
    jqXHR.abort()
  }

  jqXHR = $.ajax({
      url:   url
    , type: 'POST'
    , data:  polygon
    , success: function (data) {
        console.log('geo_query was successful(!) and returned:')
        console.log(data)
        if (callback) { callback(data) }
      }
    , error: function(e) {
        console.log("ERROR")
        console.log(e) } })
}

module.exports = { get_site: get_site
                 , topics:   topics
                 , tables:   tables
                 , fields:   fields
                 , geo_query:   geo_query
                 , geographies: geographies }



// PRIVATE

var request = function (args) {
  var resource, specify
  if (args.resource) {
    resource = args.resource + '/' }
  else { 
    resource = '' }

  if (args.specify) {
    specify = args.specify + '/' }
  else { 
    specify = '' }

  // console.log(api_base + resource + specify)
  jQuery.ajax({
      url: api_base + resource + specify
    , type: 'GET'
    // , contentType: 'application/json'
    , success: function (data) {
        if (args.callback) {
          var data = data
          if (!_.isArray(data)) { data = Array(data) }
          args.callback(data)
        }
      }
    , error: function (e) { console.log('Error: ' + e) }
  })
}
