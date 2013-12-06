var report = {}
  , config

// Public

var init = function (report_el, content_el) {
  report         = report_el
  report.content = content_el
} // sets up the DOM element, sets private variables for this module to access


var add_from_select = function (args) {
  
  // given select values, call add_field
}


var add_category = function () {
  // instead of getting the value of selects to build a field object to query the database with, 
  // this takes an object of predefined field objects for a category:
  // those most important fields for a category which can be pared or added to later by the user

  // loops through the object calling ReportManager#add_field
  category = config.categories.transportation
  _.forEach(category.data, function (set) {
    _.forEach(set.fields, function (field) {
      
      add_field({ table: set.table, field: field })
    })
  })
}


// Private


var add_field = function (args) {
  // given table and field names, adds field to report
  // need schema, data
  options = {
      table:   args.table
    , field:   args.field
    , schema:  args.schema
    , geojson: args.geojson
  }
  get_summary( options, function (data) { display_field( data ) })
}


var display_field = function (data) {
  var div = "<div class='report-item'>"
          + result.name + ": " + result.value
          + "</div>"
  report.content.append( div )
}


var get_summary = function (args) {
  // sum or average the field based on geography / keys
  var operation = field.alias.indexOf('%') != -1 ? 'AVG' : 'SUM'
    , query
    , geojson  = args.geojson
    , keys     = geojson_to_keys( geojson )
    , callback = args.callback
    , query = "SELECT "+ operation +" t."+ field
      + " IN "+ keys.join(', ')
      + " FROM "+ schema +"."+ table +" as t;"

  if (callback) callback() // query result -- see QueryManager
}


var geojson_to_keys = function(geojson) {
  return _.map(geojson.features, function (feature) {
    return feature.properties.key })
}