;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
report_sets = {
  transportation: { category: 'transportation',
    data: [
    {
      table: 'means_transportation_to_work_by_residence', 
      fields: ['ctv_p', 'pubtran_p', 'bicycle_p', 'walk_p', 'other_p'] },
    {
      table: 'travel_time_to_work', 
      fields: ['mlt15_p', 'm15_30_p', 'm30_45_p', 'm45_60_p', 'm60ovr_p'] },
    {
      table: 'vehicles_per_household', 
      fields: ['c0_p', 'c1_p', 'c2_p', 'c3p_p'] }
    ]},

  economy: { category: 'economy',
    data: [
    {
      table: 'poverty_by_household_type', 
      fields: ['pov_hh', 'pov_hh_p'] },
    {
      table: 'unemployment', 
      fields: ['tot_lf', 'emp_lf', 'unemp_num', 'unemp_rt'] }
    ]},

  housing: { category: 'housing',
    data: [
    {
      table: 'housing_cost_burden', 
      fields: ['cb_3050_p', 'cb_50_p'] },
    {
      table: 'rent', 
      fields: ['med_c_r'] },
    {
      table: 'housing_tenure', 
      fields: ['sf_p', 'mf_p', 'oth_p', 'r_hu_p'] }
    ]},

  demographics: { category: 'demographics',
    data: [
    {
      table: 'mobility_in_migration', 
      fields: ['same_p', 'diff_p', 'abroad_p'] }
    ]},

  education: { category: 'education',
    data: [
    {
      table: 'educational_attainment_25_years', 
      fields: ['lths_p', 'hs_p', 'some_c_p', 'assocba_p', 'prof_p'] }
    ]},
}


module.exports = { report_sets: report_sets }
},{}],2:[function(require,module,exports){
var QueryManager = require('./query_manager')

var get_topics = function (callback) {
  // console.log('DataManager#get_topics')
  var categories = []

  QueryManager.meta('tabular', 'list', 'verbose', function(data) { 
    // console.log( 'QueryManager#meta with data: ' + data )
    
    _.forEach(data, function (table) {
      categories.push(table['category']) })
    if (callback) { callback( _.unique(categories) ) }
  })
}


var get_tables = function (category, callback) {
  // console.log( 'DataManager#get_tables' )
  var tables = []

  QueryManager.meta('tabular', 'list', 'verbose', function(data) { 
    // console.log( 'QueryManager#meta with data: ' + data )
    _.forEach(data, function (table) {
      if ( table['category'] === category ){
        tables.push( table )
      }
    })
    if (callback) { callback(tables) }
  })
}


var get_fields = function (args) {
  // console.log('DataManager#get_fields')
  var table    = args['table'],
      callback = args['callback']
  
  QueryManager.meta('tabular', table, 'meta', function(data) { 
    if (callback) { callback( data.attributes ) }
  })
}

var get_geographies = function (args) {
  // console.log('DataManager#get_fields')
  var table    = args['table'],
      callback = args['callback']
  
  QueryManager.meta('tabular', table, 'meta', function(data) { 
    if (callback) { callback( data.summary_levels ) }
  })
}


var get = function (args) {
  // console.log('DataManager#get')
  // console.log('GET'+ args['data'] +' where '+ args['from'] +' = '+ args['using'] +'.' )
}



module.exports = {
    get_topics:  get_topics
  , get_tables:  get_tables
  , get_fields:  get_fields
  , get_geographies: get_geographies 
}
},{"./query_manager":7}],3:[function(require,module,exports){
/*

LegendManager

Creates and updates the legend, given the current dataset for the viewable map extent.

Public interface: 
  set_legend is passed the map, dataset, and field name being added to the extent.
  style is passed the property of a GeoJSON feature for styling before MapManager adds it to the map.

*/

var legend = L.control({position: 'bottomright'})
  , colors = [ '#FEFEFE'
             , '#D0D1E6'
             , '#A6BDDB'
             , '#67A9CF'
             , '#1C9099'
             , '#016C59' ]
  , breaks
  , field


var define_legend_breaks = function (data, field, callback) {
  breaks = []
  var intervals = 5
    , arr = _.map(data.features, function(elem) { return parseFloat( elem.properties[field] ) } )
    , max = _.max(arr)
    , min = _.min(arr)
    , dif = max-min
    , div = dif/intervals

  for (var i = 0; i <= intervals; i++ ) {
    num = min + ( i * div )
    num = parseFloat( num.toFixed(1) )
    breaks.push( num ) }

  if (callback) return callback(breaks)
}



var getBreakColor = function (breaks, prop) {

    return prop > breaks[5] ? colors[5] : 
           prop > breaks[4] ? colors[4] : 
           prop > breaks[3] ? colors[3] : 
           prop > breaks[2] ? colors[2] : 
           prop > breaks[1] ? colors[1] :
                              colors[0]

}


var style = function (feature) {
  return {
      fillColor: getBreakColor(breaks, feature.properties[field])
    , fillOpacity: 0.45
    , weight: 1
    , color: '#BBB'
    , opacity: 1
  }
}


var set_legend = function (args) {
  field = args['field']
  var map   = args['map']
  $('.info.legend').remove()

  define_legend_breaks( args['data'], field, function (breaks) {
    
    legend.onAdd = function () {
      var div    = L.DomUtil.create('div', 'info legend')
        , labels = [];

        // console.log('breaks inside')
        // console.log(breaks)
      
      div.innerHTML = "<h4>Legend</h4>"
      // loop through our intervals and generate a label with a colored square for each interval
      for (var i = 0; i < breaks.length-1; i++) {
        div.innerHTML +=
          '<i style="background:' + getBreakColor(breaks, breaks[i] + 1) + '"></i> ' +
          breaks[i] + (breaks[i + 1] ? '&ndash;' + breaks[i + 1] + '<br>' : '+') }

      // console.log('this is the div: ')
      // console.log(div)
      return div
    }

    // console.log('legend')
    // console.log(legend)

    // console.log('map.hasLayer(legend)')
    // console.log(map.hasLayer(legend))

    // map.removeControl(legend)
    legend.addTo(map)
  })
}


module.exports = {
    set_legend: set_legend
  , style: style
}
},{}],4:[function(require,module,exports){


var Mediator      = require('./mediator').mediator

var DataManager   = require('./data_manager')
var MapManager    = require('./map_manager')
var QueryManager  = require('./query_manager')
var SelectManager = require('./select_manager')
var ReportManager = require('./report_manager')
var ZoomManager   = require('./zoom_manager')


DataManager.get_topics( function (topics) {
  $('select#topic').html(
    SelectManager.generate_options(topics) )

  $('select#report-topic').html(
    SelectManager.generate_options(topics) ) })


$('select').on('change', function() {
  SelectManager.populate_next( $(this) )
})


$('select#field').on('change', function () {
  var field = $(this).val()
  var geo = $('select#geography option')[1],
      geo = $(geo)

  geo.attr('selected', true) // select first geography
  
  if ( MapManager.has_study_area() ) {
    MapManager.set_study_area({
      table:     $('select#table').val()
    , field:     field
    , geography: geo.val() })
  }

  MapManager.set_overlay({
      table:     $('select#table').val()
    , field:     field
    , geography: geo.val() })
})


$('select#geography').on('change', function () {
  var geo = $(this).find(':selected')
  if ( MapManager.has_study_area() ) {
    MapManager.set_study_area({ geography: geo.val() }) }
  MapManager.set_overlay({ geography: geo.val() })  
})




var map = MapManager.init_map()
MapManager.establish_map(map)


map.on('draw:created', function (drawing) {
  MapManager.set_study_area({ study_area: drawing.layer })  })


map.on('draw:edited', function (drawing) {
  MapManager.set_study_area({ study_area: drawing.layer })  })


map.on('moveend', function () {
  MapManager.set_overlay({})  })


map.on('zoomend', function () {
  console.log( 'zoom: ' + map.getZoom() )

  var set_zoom_selects = function (sumlevs) {
    console.log('summary levels: ' + sumlevs)
    var value = ZoomManager.appropriate_sumlev(map, sumlevs)
    console.log(value)
    $("select#geography").val(value)
    $("select#geography").trigger('change')
  }

  var table = $('select#table').val()
  console.log('table: ' + table)
  DataManager.get_geographies({
    table: table,
    callback: set_zoom_selects
  })
})

$('select#field, select#geography').on('change', function() {
  var selected = $(this).find(':selected')
  selected = $(selected).text()
  $(this).next('a').html( selected )
  $(this).hide()
  console.log('selected.length')
  console.log(selected.length)
  if(selected.length > 45){
    console.log('======== longer')
    console.log($('#title-bar a'))
    $('#title-bar a').css('font-size-adjust', '0.3')
  } else {
    console.log('======== shorter')
    $('#title-bar a').css('font-size-adjust', '0.0')
  }
  if($(this).attr('id') !== 'geography') $('select#geography').trigger('change')
})

$('a#field, a#geography').on('click', function() {
  $(this).prev().show()
  $(this).html('')
})





var report = ReportManager.init( $('#report'), $('#content') )

$('#add-report-topic').on('click', function() {
  var selected = $('select#report-topic').find(':selected')
  var value    = selected.val().toLowerCase()
  ReportManager.request_category(value, $('#report #content') )
})


$('#add-this-field').on('click', function() {
  console.log('the click')
  ReportManager.request_field()
})



// ReportManager.display_report(report.content)
// ReportManager.display_single_field( $("#report #transportation .fields"), {title: 'Test', value: '12'} )




// This is more what I imagined but it did not turn out that way. VVV


// map.on( 'load', function()     { Mediator.publish( 'map_loaded ') } )
// map.on( 'moveend', function () { Mediator.publish( 'map_moved' ) } )
// map.on( 'zoomend', function () { Mediator.publish( 'map_zoomed' ) } )

// Mediator.subscribe( 'map_loaded', MapManager.init() )
// Mediator.subscribe( 'map_moved',  MapManager.handle_move() )
// Mediator.subscribe( 'map_zoomed', MapManager.handle_zoom() )


// map.on( 'draw:create',  function (drawing) { Mediator.publish( 'figure_drawn' ) } )
// map.on( 'draw:edited',  function (drawing) { Mediator.publish( 'figure_edited' ) } )
// map.on( 'draw:deleted', function () { Mediator.publish( 'figure_deleted' ) } )

// Mediator.subscribe( 'figure_drawn',   StudyAreaManager.handle_draw( drawing ) )
// Mediator.subscribe( 'figure_edited',  StudyAreaManager.handle_edit( drawing ) )
// Mediator.subscribe( 'figure_deleted', StudyAreaManager.handle_delete() )


// $('select').on('change', function () {
//   var self  = $(this),
//       value = self.val() // TODO or something like this
//   if (self.id === 'field') {
//     Mediator.publish ( 'field_changed', value )
//   } else {
//     Mediator.publish( 'select_changed', {self: self, next: self.next(), value: value} ) }
// })

// Mediator.subscribe( 'select_changed', SelectManager.populate_next( args ) )
// Mediator.subscribe( 'field_changed',  MapManager.change_field( field ) )

},{"./data_manager":2,"./map_manager":5,"./mediator":6,"./query_manager":7,"./report_manager":8,"./select_manager":9,"./zoom_manager":10}],5:[function(require,module,exports){
/*

MapManager



*/

var LegendManager = require('./legend_manager')

var table, field, geography, study_area
  , mapc_url     = 'http://tiles.mapc.org/basemap/{z}/{x}/{y}.png'
  , mapc_attrib  = 'Tiles by <a href="http://www.mapc.org/">Metropolitan Area Planning Council</a>.'
  , tiles        = L.tileLayer( mapc_url, { attribution: mapc_attrib } )
  , extent_layer = new L.layerGroup()
  , study_layer  = new L.featureGroup()
  , drawing_layer = new L.featureGroup()
  , base_layers  = { 
      "MAPC Basemap": tiles }
  , over_layers  = {
      "Map Extent": extent_layer,
      "Study Area": study_layer,
      "Drawing": drawing_layer }


var layer_control = L.control.layers(base_layers, over_layers)
  , draw_control = new L.Control.Draw({
      draw: {
        position: 'topleft',
        polygon: {
          title: 'Draw your neighborhood!',
          allowIntersection: false,
          drawError: {
            color: '#b00b00',
            timeout: 1000 },
          shapeOptions: {
            color: '#2255BB' },
          showArea: true },
        polyline: false,
        marker: false },
      edit: {
        featureGroup: drawing_layer } });


var map = L.map('map', {
      center: new L.LatLng(42.363364,-71.067494)
    , zoom: 15
    , layers: tiles })


var init_map = function () {
  return map
}


var establish_map = function (map) {
  extent_layer.addTo(map)
  study_layer.addTo(map)
  drawing_layer.addTo(map)
  layer_control.addTo(map)
  map.addControl(draw_control)
}





var set_overlay = function(args) {
  console.log('global#set_overlay')
  if( args.table )     { table     = args.table }
  if( args.field )     { field     = args.field }
  if( args.geography ) { geography = args.geography }

  if (typeof table === 'undefined' || typeof field === 'undefined' || typeof geography === 'undefined'){
    console.log('throw error')
  }

  get_layer({
      table:     table
    , field:     field
    , geography: geography
    , polygon:   L.rectangle( map.getBounds() ).toGeoJSON()
    , add_to:    extent_layer })
}


var set_study_area = function(args){
  console.log('global#set_study_area')
  if( args.table )      { table      = args.table }
  if( args.field )      { field      = args.field }
  if( args.geography )  { geography  = args.geography }
  if( args.study_area ) { study_area = args.study_area }

  if (typeof table === 'undefined' || typeof field === 'undefined' || typeof geography === 'undefined'){
    console.log('throw error')
  }

  drawing_layer.addLayer( study_area )

  get_layer({
      table:     table
    , field:     field
    , geography: geography
    , polygon:   study_area.toGeoJSON()
    , add_to:    study_layer }) 
}


var get_table = function () {
  return table }


var has_study_area = function () {
  if (typeof study_area != 'undefined') { return true }
  return false }


// public interface

module.exports = {
    init_map:       init_map
  , establish_map:  establish_map
  , set_overlay:    set_overlay
  , set_study_area: set_study_area
  , has_study_area: has_study_area
}

// private

var get_layer = function(args) {
  console.log('global#get_layer')
  
  var base_url = 'http://localhost:2474/geographic/spatial/'
    , url = base_url + args.geography + '/tabular/' + args.table + '/' + field + '/intersect'
    , polygon = args.polygon

  console.log(url)

  $.ajax({
      url: url
    , type: 'POST'
    , data: args.polygon.geometry
    , success: function (data) {
        console.log('global#get_layer: success. Now, the data:')
        console.log(data)
        LegendManager.set_legend({ map: map, field: field, data: data })
        args.add_to.clearLayers()
        args.add_to.addLayer( L.geoJson( data, { style: LegendManager.style } ) )
      }
    , error: function(e) {
        console.log("ERROR")
        console.log(e) } })
}
},{"./legend_manager":3}],6:[function(require,module,exports){
/*
  
  Mediator implementation
  by Addy Osmani
  http://addyosmani.com/largescalejavascript/

*/

var mediator = (function(){
  var subscribe = function(channel, fn){
    if (!mediator.channels[channel]) mediator.channels[channel] = [];
    mediator.channels[channel].push({ context: this, callback: fn });
    return this;
  },
 
  publish = function(channel){
    if (!mediator.channels[channel]) return false;
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
      var subscription = mediator.channels[channel][i];
      subscription.callback.apply(subscription.context, args);
    }
    return this;
  };
 
  return {
    channels: {},
    publish: publish,
    subscribe: subscribe,
    installTo: function(obj){
      obj.subscribe = subscribe;
       obj.publish = publish;
    }
  };

}());

module.exports = { mediator: mediator }
},{}],7:[function(require,module,exports){
var api_base = 'http://localhost:2474'

var meta = function () {
  // console.log('QueryManager#meta with args: ')
  // console.log(arguments)
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop([args.length-1])
  query_path = '/' + args.join("/")
  request({ 
    path: query_path,
    callback: callback })
}

var request = function(args) {
  var callback = args['callback']
  console.log('QueryManager#request with args: ')
  console.log(args)
  var base = args['api_base']   || api_base
    , path = args['path']       || '/'
    , opts = args['query_args'] || ''
    , type = args['method']     || 'GET'
    , data = args['data']       || null

  var url = base + path + opts
  // console.log('url:' + url)

  $.ajax({
    url: url,
    type: type,
    data: data,
    success: function (data) {
      console.log( 'SUCCESS: ' )
      console.log( data )
      if (callback) callback(data)
      },
    error: function (e) {
      console.log( 'ERROR: ' )
      console.log( e ) }
  })
}

module.exports = {   meta: meta
                   , request: request }
},{}],8:[function(require,module,exports){
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
},{"./config.js":1,"./query_manager":7}],9:[function(require,module,exports){
var DataManager = require('./data_manager')

// SelectManager.init = function () {
//   var topic     = $('select#topic')
//     , table     = $('select#table')
//     , field     = $('select#field')
//     , geography = $('select#geography')
//     , selects = [topic, table, field, geography]

//   _.forEach(selects, function (select) {
//     SelectManager.populate( select,  )
//   })
// }

// SelectManager.update_controls = function (args) {
//   console.log('SelectManager#update_controls with args: ' + args)
//   SelectManager.populate({ element: args['to_update']
//                          , using:   args['selected']
//                          , from:    args['changed'] 
//                         }) }

// var populate_next = function()

// SelectManager.populate = function (args) {
//   console.log('SelectManager#populate with args: ' + args)
//   var element = args['element']   // table select
//     , using   = args['using']     // topic option
//     , changed = args['changed']   // topic select
//   // get( 'table', 'topic', 'transportation' )
//   var pairs = DataManager.get({ data: element.id, from: changed.id, using: using.value })
//   var options = SelectManager.generate_options(pairs, { placeholder: 'Select' + element.id })
//   element.html(options) }


var generate_options = function (pairs, opts) {
  console.log("PAIRS")
  
  var opts        = opts || {}
    , placeholder = opts['placeholder'] || "Choose one"
    , text        = opts['text']
    , value       = opts['value']
    , options     = []
  
  if (_.isString(pairs[0])) {     // TODO: lazy
    pairs = pairs_from_array(pairs)
    console.log(pairs) }
  else if (_.isObject(pairs[0])) {
    pairs = pairs_from_objects({ objects: pairs, text: text, value: value }) 
    console.log(pairs) 
  }

  options.push('<option value="">' + placeholder + '</option>') // creates placeholder
  options.push( options_from_hash(pairs, opts) )                // adds options to array
  return options.join("\n")                                     // joins array of options to make html
}


// These standardize pairs for generating select boxes.

var pairs_from_array = function (array) {
  var pairs = {}
  _.forEach(array, function(element) { pairs[element] = element })
  return pairs }


var pairs_from_objects = function (args) {
  var objects = args['objects']
    , text    = args['text']
    , value   = args['value']
    , pairs   = []

  _.forEach(objects, function(object) { 
    pairs[object[text]] = object[value] })

  return pairs }

// end


var options_from_hash = function (pairs, opts) {
  var options = []
    , selected = ''
  _.forIn(pairs, function(value, key){
    options.push('<option value="'+ value +'" '+ selected +'>'+ key +'</option>')
  });
  return options
}



// TODO: get the select box to know how to get their own values

var populate_next = function (obj) {
  var value = obj.val()
    , next  = obj.next( 'select' )
    , id    = obj.attr( 'id' )
    , opts  = {}

  // console.log('-------------------')
  // console.log('populate_next with param ') ; console.log( obj )
  // console.log('value ' + value)      ; console.log('id ' + id)
  // console.log('next ')               ; console.log(next)
  // console.log('-------------------')

  switch (id) {
    case 'topic':
      opts = {text: 'title', value: 'name'}
      DataManager.get_tables(value, function (pairs) {
        next.html( generate_options(pairs, opts) )
      })
      break;
    case 'table':
      opts = {text: 'alias', value: 'field_name'}
      DataManager.get_fields({ table: value, callback: function (pairs) {
        next.html( generate_options(pairs, opts) )
      }})
      opts_geo = {text: 'title', value: 'name'}
      DataManager.get_geographies({table: value, callback: function (pairs) {
        $('select#geography').html( generate_options(pairs, opts_geo) )
      }})
      break;
  }
}


module.exports = {
    generate_options:  generate_options
  , populate_next: populate_next
}
},{"./data_manager":2}],10:[function(require,module,exports){

var zoom_config = {
      8:  'municipality'
    , 12: ['census_tract', 'school_district']
    , 15: 'census_blockgroup' }


var arrayify = function (hash) {
  console.log('ZoomManager#arrayify')
  var max   = _.max( _.map(_.keys(hash), function (e) { return _.parseInt(e) } ))
    , array = Array(max) // TODO: or, map.maxZoom()

  _.each(hash, function(value, key) {
    array[key] = value })
  console.log(array)
  return array
}

var zoom_array = arrayify(zoom_config) 

var appropriate_sumlev = function (map, sumlevs) {
  var return_value
  console.log('ZoomManager#appropriate_sumlev')
  // returns a value like 'census_blockgroup'
  
  // starts at current zoom, unless that's too high
  var start_zoom = map.getZoom()
  if ( start_zoom > zoom_array.length ) start_zoom = zoom_array.length

  // console.log('start zoom: ' + start_zoom)
  // work back from closest to farthest
  for (var zoom = start_zoom; zoom > -1; zoom--){
    options = zoom_array[zoom]  // ret: 'census_blocks' or ['ct', 'sd']
    if (! _.isArray(options)) options = [options] // force to be Array

    _.each(options, function(option) {
      // console.log('option: ' + option)
      if (typeof return_value != 'undefined') return false
      _.forIn(sumlevs, function (sumlev, key) {
        // console.log('sumlev: ' + sumlev.name)
        if (sumlev.name === option) {
          console.log('RETURNING ' + sumlev.name)
          return_value = sumlev.name
        }
      })  
    })
  }
  console.log('return_value: ' + return_value)
  return return_value
}

module.exports = {
  appropriate_sumlev: appropriate_sumlev
}
},{}]},{},[4])
;