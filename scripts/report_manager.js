var report = {}


var mock_report = [
  {
    "category": "transportation",
    "fields": [
      {
        "title": "% Car",
        "value": 20
      },
      {
        "title": "% Public Transit",
        "value": 60
      },
      {
        "title": "% Bike or Walk",
        "value": 20
      }
    ]
  },
  {
    "category": "economy",
    "fields": [
      {
        "title": "% Households in Poverty",
        "value": 18
      },
      {
        "title": "% Unemployed",
        "value": 6
      },
      {
        "title": "Total Unemployed",
        "value": 212
      }
    ]
  }
]



// Public

var init = function (report_el, content_el) {
  report.container = report_el
  report.content   = content_el
  return report
} // sets up the DOM element, sets private variables for this module to access


var display_report = function (content_el) {
  _.each(mock_report, function(category){

    // create an empty category div
    category_div = makeCategoryDiv(category.category)
    $(content_el).append(category_div)

    var header ='<h4>'+ category.category +'</h4>'
    var id = '#' + category.category
    console.log('ID: ' + id)
    $(id).append(header);

    console.log("START CATEGORY")
    console.log(category_div)
    // fill it with fields
    _.each(category.fields, function (field) {
      field_div = makeFieldDiv({
          title: field.title
        , value: field.value
      })

      console.log('field_div')
      console.log(field_div)
      $(id).append(field_div)
      
    })
  })
}



module.exports = {
    init:           init
  , display_report: display_report
}


// Private


var makeCategoryDiv = function (id) {
  var div = '<div class="category" id="'+ id +'"></div>'
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