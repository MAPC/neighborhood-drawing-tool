var report = {}
  , categories = require('./config.js').report_sets
  , QueryManager = require('./query_manager')


// Public

var init = function (report_el, content_el) {
  report.container = report_el
  report.content   = content_el
  return report
} // sets up the DOM element, sets private variables for this module to access


var display_report = function (content_el) {
  _.each(categories, function(category){

    display_category(category, content_el)

  })
}


var request_field = function (args) {
  if (typeof args === 'undefined') { args = {} }
  var category_div = args.category_div  || $('#report')
  var data = {
        table:         args.table || 'means_transportation_to_work_by_residence'
      , keys:          args.keys          || [19, 21]
      , summary_level: args.summary_level || 'municipality'
      , field:         args.field || 'ctv_p' 
  }

  console.log('ReportManager#request_field')
  console.log(data)

  QueryManager.request({
      path:   '/report/field'
    , method: 'POST'
    , data:   data
    , callback: function (data) { 
      display_single_field(category_div, data)
    }
  })
}



var request_category = function(category_name, element) {
  var data = {
      category: categories[category_name]
    , keys: [19, 21]
    , summary_level: 'municipality'}
  QueryManager.request({
      path:     '/report'
    , method:   'POST'
    , data:     data
    , callback: function(data) { 
        display_category(data[category_name], element)
        $('a.delete').on('click', function () { 
          console.log( $(this).parent().remove() )
        })
      }
  })
}


var display_category = function (category, content_el) {
  var category_name = category.category
  var category_div = makeCategoryDiv(category_name)
  $(content_el).append(category_div)
  report.content[category_name] = {}
  report.content[category_name].fields = $(category_div)

  var header ='<h4>'+ category_name +'</h4><a class="delete">delete</a>'
    , fields_div = '#' + category_name + ' .fields'
    , fields_div = $(fields_div)
  
  fields_div.append(header);

  // fill it with fields
  _.each(category.fields, function (field) {
    display_single_field( fields_div, field )
  })  
}


var display_single_field = function (category_div, field) {
  field_div = makeFieldDiv({
      title: field.title
    , value: parseFloat(field.value).toFixed(2)
  })
  category_div.append(field_div)
}


module.exports = {
    init:                   init
    , display_report:       display_report
    , display_category:     display_category
    , request_field:        request_field
    , request_category:     request_category
    , display_single_field: display_single_field
}


// Private


var makeCategoryDiv = function (id) {
  var div = '<div class="category" id="'+ id +'"><div class="fields"></div></div>'
  return div
}


var makeFieldDiv = function (args) {
  var div = '<div class="field">'
      div = div + '<div class="name">'+ args.title +'</div>'
      div = div + '<div class="separator">:</div>'
      div = div + '<div class="value">'+ args.value +'</div>'
      div = div + '<a class="delete">delete</a>'
      div = div + '</div>'
  return div
}


var clear = function () {
  report.content.empty()
}


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


var display_field = function (result) {
  var div = "<div class='field'>"
          +   "<div class='name'>"+ result.name +"</div>"
          +   "<div class='separator'>:</div>"
          +   "<div class='value'>"+ result.value +"</div>"
          +   "<a class='delete'>delete</a>"
          + "</div>"
  report.content.append( div )
}


var get_summary = function (args) {
  // sum or average the field based on geography / keys
  var geojson   = args.geojson
    , keys      = geojson_to_keys( geojson )
    // , 
    , callback  = args.callback
    // , suffix    = 
  // if (callback) callback() // query result -- see QueryManager
}


var geojson_to_keys = function(geojson) {
  return _.map(geojson.features, function (feature) {
    return feature.properties.key })
}