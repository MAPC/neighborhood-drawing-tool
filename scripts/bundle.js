;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./query_manager":5}],2:[function(require,module,exports){
// TODO set up jQuery document ready
// TODO set up map

console.log('NDT')

var Mediator      = require('./mediator').mediator

var QueryManager  = require('./query_manager')
var DataManager   = require('./data_manager')
var SelectManager = require('./select_manager')
var MapManager    = require('./map_manager')
var ZoomManager   = require('./zoom_manager')


DataManager.get_topics( function (topics) {
  $('select#topic').html(
    SelectManager.generate_options(topics) )  })


$('select').on('change', function() {
  SelectManager.populate_next( $(this) ) })


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
  console.log('draw#edited')  })


map.on('moveend', function () {
  MapManager.set_overlay({})  })


map.on('zoomend', function () {
  console.log( 'zoom: ' + map.getZoom() )

  var callback = function (sumlevs) {
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
    callback: callback
  })
})









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

},{"./data_manager":1,"./map_manager":3,"./mediator":4,"./query_manager":5,"./select_manager":6,"./zoom_manager":7}],3:[function(require,module,exports){

var table, field, geography, study_area
  , mapc_url     = 'http://tiles.mapc.org/basemap/{z}/{x}/{y}.png'
  , mapc_attrib  = 'Tiles by <a href="http://www.mapc.org/">Metropolitan Area Planning Council</a>.'
  , tiles        = L.tileLayer( mapc_url, { attribution: mapc_attrib } )
  , extent_layer = new L.layerGroup()
  , study_layer  = new L.featureGroup()
  , base_layers  = { 
      "MAPC Basemap": tiles }
  , over_layers  = {
      "Map Extent": extent_layer,
      "Study Area": study_layer }

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
        featureGroup: study_layer } });

var map = L.map('map', {
      center: new L.LatLng(42.4, -71.8)
    , zoom: 11
    , layers: tiles })

var init_map = function () {
  return map
}

var establish_map = function (map) {
  extent_layer.addTo(map)
  study_layer.addTo(map)
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

  study_layer.addLayer( study_area )

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
  , has_study_area: has_study_area }



// private

var get_layer = function(args) {
  console.log('global#get_layer')
  
  // args.geography = 'ma_census_tracts'

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
        args.add_to.clearLayers()
        args.add_to.addLayer( L.geoJson(data) )
      }
    , error: function(e) {
        console.log("ERROR")
        console.log(e) } })
}
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
  // console.log('QueryManager#request with args: ')
  // console.log(args)
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
    success: function (data) {
      // console.log( 'SUCCESS: ' )
      // console.log( data )
      if (callback) callback(data)
      },
    error: function (e) {
      console.log( 'ERROR: ' )
      console.log( e ) }
  })
}

module.exports = { meta: meta }
},{}],6:[function(require,module,exports){
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
  var opts = opts || {}
    , placeholder = opts['placeholder'] || "Choose one"
    , text = opts['text']
    , value = opts['value']
    , options = []
  console.log("pairs")
  console.log(pairs)
  console.log('text:'+ text +', value:' + value)
  if (_.isString(pairs[0])) {
    pairs = pairs_from_array(pairs) }
  else if (_.isObject(pairs[0])) {
    pairs = pairs_from_objects({ objects: pairs, text: text, value: value }) 
    // console.log(pairs) 
  }


  options.push('<option value="">' + placeholder + '</option>')
  options.push( options_from_hash(pairs, opts) )
  return options.join("\n") }


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


var options_from_hash = function (pairs, opts) {
  var options = []
    , selected = ''
  _.forIn(pairs, function(value, key){
    options.push('<option value="'+ value +'" '+ selected +'>'+ key +'</option>')
  });
  return options
}

var populate_next = function (obj) {
  var value = obj.val()
    , next  = obj.next()
    , id    = obj.attr('id')
    , opts  = {}

  // console.log('populate_next with ') ; console.log( obj )
  // console.log('value ' + value)      ; console.log('id ' + id)
  // console.log('next ')               ; console.log(next)

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
        next.next().html( generate_options(pairs, opts_geo) )
      }})
      break;
  }
}


module.exports = {
    generate_options:  generate_options
  , populate_next: populate_next
}
},{"./data_manager":1}],7:[function(require,module,exports){

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
},{}]},{},[2])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL2RhdGFfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWFpbi5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWFwX21hbmFnZXIuanMiLCIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL21lZGlhdG9yLmpzIiwiL1VzZXJzL21hcGN1c2VyL1Byb2plY3RzL25laWdoYm9yaG9vZC1kcmF3aW5nLXRvb2wvc2NyaXB0cy9xdWVyeV9tYW5hZ2VyLmpzIiwiL1VzZXJzL21hcGN1c2VyL1Byb2plY3RzL25laWdoYm9yaG9vZC1kcmF3aW5nLXRvb2wvc2NyaXB0cy9zZWxlY3RfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvem9vbV9tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFF1ZXJ5TWFuYWdlciA9IHJlcXVpcmUoJy4vcXVlcnlfbWFuYWdlcicpXG5cbnZhciBnZXRfdG9waWNzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdEYXRhTWFuYWdlciNnZXRfdG9waWNzJylcbiAgdmFyIGNhdGVnb3JpZXMgPSBbXVxuXG4gIFF1ZXJ5TWFuYWdlci5tZXRhKCd0YWJ1bGFyJywgJ2xpc3QnLCAndmVyYm9zZScsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgLy8gY29uc29sZS5sb2coICdRdWVyeU1hbmFnZXIjbWV0YSB3aXRoIGRhdGE6ICcgKyBkYXRhIClcbiAgICBcbiAgICBfLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHRhYmxlKSB7XG4gICAgICBjYXRlZ29yaWVzLnB1c2godGFibGVbJ2NhdGVnb3J5J10pIH0pXG4gICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKCBfLnVuaXF1ZShjYXRlZ29yaWVzKSApIH1cbiAgfSlcbn1cblxuXG52YXIgZ2V0X3RhYmxlcyA9IGZ1bmN0aW9uIChjYXRlZ29yeSwgY2FsbGJhY2spIHtcbiAgLy8gY29uc29sZS5sb2coICdEYXRhTWFuYWdlciNnZXRfdGFibGVzJyApXG4gIHZhciB0YWJsZXMgPSBbXVxuXG4gIFF1ZXJ5TWFuYWdlci5tZXRhKCd0YWJ1bGFyJywgJ2xpc3QnLCAndmVyYm9zZScsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgLy8gY29uc29sZS5sb2coICdRdWVyeU1hbmFnZXIjbWV0YSB3aXRoIGRhdGE6ICcgKyBkYXRhIClcbiAgICBfLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHRhYmxlKSB7XG4gICAgICBpZiAoIHRhYmxlWydjYXRlZ29yeSddID09PSBjYXRlZ29yeSApe1xuICAgICAgICB0YWJsZXMucHVzaCggdGFibGUgKVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKHRhYmxlcykgfVxuICB9KVxufVxuXG5cbnZhciBnZXRfZmllbGRzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgLy8gY29uc29sZS5sb2coJ0RhdGFNYW5hZ2VyI2dldF9maWVsZHMnKVxuICB2YXIgdGFibGUgICAgPSBhcmdzWyd0YWJsZSddLFxuICAgICAgY2FsbGJhY2sgPSBhcmdzWydjYWxsYmFjayddXG4gIFxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsIHRhYmxlLCAnbWV0YScsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKCBkYXRhLmF0dHJpYnV0ZXMgKSB9XG4gIH0pXG59XG5cbnZhciBnZXRfZ2VvZ3JhcGhpZXMgPSBmdW5jdGlvbiAoYXJncykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0X2ZpZWxkcycpXG4gIHZhciB0YWJsZSAgICA9IGFyZ3NbJ3RhYmxlJ10sXG4gICAgICBjYWxsYmFjayA9IGFyZ3NbJ2NhbGxiYWNrJ11cbiAgXG4gIFF1ZXJ5TWFuYWdlci5tZXRhKCd0YWJ1bGFyJywgdGFibGUsICdtZXRhJywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBpZiAoY2FsbGJhY2spIHsgY2FsbGJhY2soIGRhdGEuc3VtbWFyeV9sZXZlbHMgKSB9XG4gIH0pXG59XG5cblxudmFyIGdldCA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdEYXRhTWFuYWdlciNnZXQnKVxuICAvLyBjb25zb2xlLmxvZygnR0VUJysgYXJnc1snZGF0YSddICsnIHdoZXJlICcrIGFyZ3NbJ2Zyb20nXSArJyA9ICcrIGFyZ3NbJ3VzaW5nJ10gKycuJyApXG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRfdG9waWNzOiAgZ2V0X3RvcGljc1xuICAsIGdldF90YWJsZXM6ICBnZXRfdGFibGVzXG4gICwgZ2V0X2ZpZWxkczogIGdldF9maWVsZHNcbiAgLCBnZXRfZ2VvZ3JhcGhpZXM6IGdldF9nZW9ncmFwaGllcyBcbn0iLCIvLyBUT0RPIHNldCB1cCBqUXVlcnkgZG9jdW1lbnQgcmVhZHlcbi8vIFRPRE8gc2V0IHVwIG1hcFxuXG5jb25zb2xlLmxvZygnTkRUJylcblxudmFyIE1lZGlhdG9yICAgICAgPSByZXF1aXJlKCcuL21lZGlhdG9yJykubWVkaWF0b3JcblxudmFyIFF1ZXJ5TWFuYWdlciAgPSByZXF1aXJlKCcuL3F1ZXJ5X21hbmFnZXInKVxudmFyIERhdGFNYW5hZ2VyICAgPSByZXF1aXJlKCcuL2RhdGFfbWFuYWdlcicpXG52YXIgU2VsZWN0TWFuYWdlciA9IHJlcXVpcmUoJy4vc2VsZWN0X21hbmFnZXInKVxudmFyIE1hcE1hbmFnZXIgICAgPSByZXF1aXJlKCcuL21hcF9tYW5hZ2VyJylcbnZhciBab29tTWFuYWdlciAgID0gcmVxdWlyZSgnLi96b29tX21hbmFnZXInKVxuXG5cbkRhdGFNYW5hZ2VyLmdldF90b3BpY3MoIGZ1bmN0aW9uICh0b3BpY3MpIHtcbiAgJCgnc2VsZWN0I3RvcGljJykuaHRtbChcbiAgICBTZWxlY3RNYW5hZ2VyLmdlbmVyYXRlX29wdGlvbnModG9waWNzKSApICB9KVxuXG5cbiQoJ3NlbGVjdCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgU2VsZWN0TWFuYWdlci5wb3B1bGF0ZV9uZXh0KCAkKHRoaXMpICkgfSlcblxuXG4kKCdzZWxlY3QjZmllbGQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICB2YXIgZmllbGQgPSAkKHRoaXMpLnZhbCgpXG4gIHZhciBnZW8gPSAkKCdzZWxlY3QjZ2VvZ3JhcGh5IG9wdGlvbicpWzFdLFxuICAgICAgZ2VvID0gJChnZW8pXG5cbiAgZ2VvLmF0dHIoJ3NlbGVjdGVkJywgdHJ1ZSkgLy8gc2VsZWN0IGZpcnN0IGdlb2dyYXBoeVxuICBcbiAgaWYgKCBNYXBNYW5hZ2VyLmhhc19zdHVkeV9hcmVhKCkgKSB7XG4gICAgTWFwTWFuYWdlci5zZXRfc3R1ZHlfYXJlYSh7XG4gICAgICB0YWJsZTogICAgICQoJ3NlbGVjdCN0YWJsZScpLnZhbCgpXG4gICAgLCBmaWVsZDogICAgIGZpZWxkXG4gICAgLCBnZW9ncmFwaHk6IGdlby52YWwoKSB9KVxuICB9XG5cbiAgTWFwTWFuYWdlci5zZXRfb3ZlcmxheSh7XG4gICAgICB0YWJsZTogICAgICQoJ3NlbGVjdCN0YWJsZScpLnZhbCgpXG4gICAgLCBmaWVsZDogICAgIGZpZWxkXG4gICAgLCBnZW9ncmFwaHk6IGdlby52YWwoKSB9KVxufSlcblxuXG4kKCdzZWxlY3QjZ2VvZ3JhcGh5Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGdlbyA9ICQodGhpcykuZmluZCgnOnNlbGVjdGVkJylcbiAgaWYgKCBNYXBNYW5hZ2VyLmhhc19zdHVkeV9hcmVhKCkgKSB7XG4gICAgTWFwTWFuYWdlci5zZXRfc3R1ZHlfYXJlYSh7IGdlb2dyYXBoeTogZ2VvLnZhbCgpIH0pIH1cbiAgTWFwTWFuYWdlci5zZXRfb3ZlcmxheSh7IGdlb2dyYXBoeTogZ2VvLnZhbCgpIH0pICBcbn0pXG5cblxuXG5cbnZhciBtYXAgPSBNYXBNYW5hZ2VyLmluaXRfbWFwKClcbk1hcE1hbmFnZXIuZXN0YWJsaXNoX21hcChtYXApXG5cblxubWFwLm9uKCdkcmF3OmNyZWF0ZWQnLCBmdW5jdGlvbiAoZHJhd2luZykge1xuICBNYXBNYW5hZ2VyLnNldF9zdHVkeV9hcmVhKHsgc3R1ZHlfYXJlYTogZHJhd2luZy5sYXllciB9KSAgfSlcblxuXG5tYXAub24oJ2RyYXc6ZWRpdGVkJywgZnVuY3Rpb24gKGRyYXdpbmcpIHtcbiAgY29uc29sZS5sb2coJ2RyYXcjZWRpdGVkJykgIH0pXG5cblxubWFwLm9uKCdtb3ZlZW5kJywgZnVuY3Rpb24gKCkge1xuICBNYXBNYW5hZ2VyLnNldF9vdmVybGF5KHt9KSAgfSlcblxuXG5tYXAub24oJ3pvb21lbmQnLCBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCAnem9vbTogJyArIG1hcC5nZXRab29tKCkgKVxuXG4gIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIChzdW1sZXZzKSB7XG4gICAgY29uc29sZS5sb2coJ3N1bW1hcnkgbGV2ZWxzOiAnICsgc3VtbGV2cylcbiAgICB2YXIgdmFsdWUgPSBab29tTWFuYWdlci5hcHByb3ByaWF0ZV9zdW1sZXYobWFwLCBzdW1sZXZzKVxuICAgIGNvbnNvbGUubG9nKHZhbHVlKVxuICAgICQoXCJzZWxlY3QjZ2VvZ3JhcGh5XCIpLnZhbCh2YWx1ZSlcbiAgICAkKFwic2VsZWN0I2dlb2dyYXBoeVwiKS50cmlnZ2VyKCdjaGFuZ2UnKVxuICB9XG5cbiAgdmFyIHRhYmxlID0gJCgnc2VsZWN0I3RhYmxlJykudmFsKClcbiAgY29uc29sZS5sb2coJ3RhYmxlOiAnICsgdGFibGUpXG4gIERhdGFNYW5hZ2VyLmdldF9nZW9ncmFwaGllcyh7XG4gICAgdGFibGU6IHRhYmxlLFxuICAgIGNhbGxiYWNrOiBjYWxsYmFja1xuICB9KVxufSlcblxuXG5cblxuXG5cblxuXG5cbi8vIG1hcC5vbiggJ2xvYWQnLCBmdW5jdGlvbigpICAgICB7IE1lZGlhdG9yLnB1Ymxpc2goICdtYXBfbG9hZGVkICcpIH0gKVxuLy8gbWFwLm9uKCAnbW92ZWVuZCcsIGZ1bmN0aW9uICgpIHsgTWVkaWF0b3IucHVibGlzaCggJ21hcF9tb3ZlZCcgKSB9IClcbi8vIG1hcC5vbiggJ3pvb21lbmQnLCBmdW5jdGlvbiAoKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdtYXBfem9vbWVkJyApIH0gKVxuXG4vLyBNZWRpYXRvci5zdWJzY3JpYmUoICdtYXBfbG9hZGVkJywgTWFwTWFuYWdlci5pbml0KCkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnbWFwX21vdmVkJywgIE1hcE1hbmFnZXIuaGFuZGxlX21vdmUoKSApXG4vLyBNZWRpYXRvci5zdWJzY3JpYmUoICdtYXBfem9vbWVkJywgTWFwTWFuYWdlci5oYW5kbGVfem9vbSgpIClcblxuXG4vLyBtYXAub24oICdkcmF3OmNyZWF0ZScsICBmdW5jdGlvbiAoZHJhd2luZykgeyBNZWRpYXRvci5wdWJsaXNoKCAnZmlndXJlX2RyYXduJyApIH0gKVxuLy8gbWFwLm9uKCAnZHJhdzplZGl0ZWQnLCAgZnVuY3Rpb24gKGRyYXdpbmcpIHsgTWVkaWF0b3IucHVibGlzaCggJ2ZpZ3VyZV9lZGl0ZWQnICkgfSApXG4vLyBtYXAub24oICdkcmF3OmRlbGV0ZWQnLCBmdW5jdGlvbiAoKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdmaWd1cmVfZGVsZXRlZCcgKSB9IClcblxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnZmlndXJlX2RyYXduJywgICBTdHVkeUFyZWFNYW5hZ2VyLmhhbmRsZV9kcmF3KCBkcmF3aW5nICkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnZmlndXJlX2VkaXRlZCcsICBTdHVkeUFyZWFNYW5hZ2VyLmhhbmRsZV9lZGl0KCBkcmF3aW5nICkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnZmlndXJlX2RlbGV0ZWQnLCBTdHVkeUFyZWFNYW5hZ2VyLmhhbmRsZV9kZWxldGUoKSApXG5cblxuLy8gJCgnc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbi8vICAgdmFyIHNlbGYgID0gJCh0aGlzKSxcbi8vICAgICAgIHZhbHVlID0gc2VsZi52YWwoKSAvLyBUT0RPIG9yIHNvbWV0aGluZyBsaWtlIHRoaXNcbi8vICAgaWYgKHNlbGYuaWQgPT09ICdmaWVsZCcpIHtcbi8vICAgICBNZWRpYXRvci5wdWJsaXNoICggJ2ZpZWxkX2NoYW5nZWQnLCB2YWx1ZSApXG4vLyAgIH0gZWxzZSB7XG4vLyAgICAgTWVkaWF0b3IucHVibGlzaCggJ3NlbGVjdF9jaGFuZ2VkJywge3NlbGY6IHNlbGYsIG5leHQ6IHNlbGYubmV4dCgpLCB2YWx1ZTogdmFsdWV9ICkgfVxuLy8gfSlcblxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnc2VsZWN0X2NoYW5nZWQnLCBTZWxlY3RNYW5hZ2VyLnBvcHVsYXRlX25leHQoIGFyZ3MgKSApXG4vLyBNZWRpYXRvci5zdWJzY3JpYmUoICdmaWVsZF9jaGFuZ2VkJywgIE1hcE1hbmFnZXIuY2hhbmdlX2ZpZWxkKCBmaWVsZCApIClcbiIsIlxudmFyIHRhYmxlLCBmaWVsZCwgZ2VvZ3JhcGh5LCBzdHVkeV9hcmVhXG4gICwgbWFwY191cmwgICAgID0gJ2h0dHA6Ly90aWxlcy5tYXBjLm9yZy9iYXNlbWFwL3t6fS97eH0ve3l9LnBuZydcbiAgLCBtYXBjX2F0dHJpYiAgPSAnVGlsZXMgYnkgPGEgaHJlZj1cImh0dHA6Ly93d3cubWFwYy5vcmcvXCI+TWV0cm9wb2xpdGFuIEFyZWEgUGxhbm5pbmcgQ291bmNpbDwvYT4uJ1xuICAsIHRpbGVzICAgICAgICA9IEwudGlsZUxheWVyKCBtYXBjX3VybCwgeyBhdHRyaWJ1dGlvbjogbWFwY19hdHRyaWIgfSApXG4gICwgZXh0ZW50X2xheWVyID0gbmV3IEwubGF5ZXJHcm91cCgpXG4gICwgc3R1ZHlfbGF5ZXIgID0gbmV3IEwuZmVhdHVyZUdyb3VwKClcbiAgLCBiYXNlX2xheWVycyAgPSB7IFxuICAgICAgXCJNQVBDIEJhc2VtYXBcIjogdGlsZXMgfVxuICAsIG92ZXJfbGF5ZXJzICA9IHtcbiAgICAgIFwiTWFwIEV4dGVudFwiOiBleHRlbnRfbGF5ZXIsXG4gICAgICBcIlN0dWR5IEFyZWFcIjogc3R1ZHlfbGF5ZXIgfVxuXG52YXIgbGF5ZXJfY29udHJvbCA9IEwuY29udHJvbC5sYXllcnMoYmFzZV9sYXllcnMsIG92ZXJfbGF5ZXJzKVxuICAsIGRyYXdfY29udHJvbCA9IG5ldyBMLkNvbnRyb2wuRHJhdyh7XG4gICAgICBkcmF3OiB7XG4gICAgICAgIHBvc2l0aW9uOiAndG9wbGVmdCcsXG4gICAgICAgIHBvbHlnb246IHtcbiAgICAgICAgICB0aXRsZTogJ0RyYXcgeW91ciBuZWlnaGJvcmhvb2QhJyxcbiAgICAgICAgICBhbGxvd0ludGVyc2VjdGlvbjogZmFsc2UsXG4gICAgICAgICAgZHJhd0Vycm9yOiB7XG4gICAgICAgICAgICBjb2xvcjogJyNiMDBiMDAnLFxuICAgICAgICAgICAgdGltZW91dDogMTAwMCB9LFxuICAgICAgICAgIHNoYXBlT3B0aW9uczoge1xuICAgICAgICAgICAgY29sb3I6ICcjMjI1NUJCJyB9LFxuICAgICAgICAgIHNob3dBcmVhOiB0cnVlIH0sXG4gICAgICAgIHBvbHlsaW5lOiBmYWxzZSxcbiAgICAgICAgbWFya2VyOiBmYWxzZSB9LFxuICAgICAgZWRpdDoge1xuICAgICAgICBmZWF0dXJlR3JvdXA6IHN0dWR5X2xheWVyIH0gfSk7XG5cbnZhciBtYXAgPSBMLm1hcCgnbWFwJywge1xuICAgICAgY2VudGVyOiBuZXcgTC5MYXRMbmcoNDIuNCwgLTcxLjgpXG4gICAgLCB6b29tOiAxMVxuICAgICwgbGF5ZXJzOiB0aWxlcyB9KVxuXG52YXIgaW5pdF9tYXAgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBtYXBcbn1cblxudmFyIGVzdGFibGlzaF9tYXAgPSBmdW5jdGlvbiAobWFwKSB7XG4gIGV4dGVudF9sYXllci5hZGRUbyhtYXApXG4gIHN0dWR5X2xheWVyLmFkZFRvKG1hcClcbiAgbGF5ZXJfY29udHJvbC5hZGRUbyhtYXApXG4gIG1hcC5hZGRDb250cm9sKGRyYXdfY29udHJvbClcbn1cblxuXG52YXIgc2V0X292ZXJsYXkgPSBmdW5jdGlvbihhcmdzKSB7XG4gIGNvbnNvbGUubG9nKCdnbG9iYWwjc2V0X292ZXJsYXknKVxuICBpZiggYXJncy50YWJsZSApICAgICB7IHRhYmxlICAgICA9IGFyZ3MudGFibGUgfVxuICBpZiggYXJncy5maWVsZCApICAgICB7IGZpZWxkICAgICA9IGFyZ3MuZmllbGQgfVxuICBpZiggYXJncy5nZW9ncmFwaHkgKSB7IGdlb2dyYXBoeSA9IGFyZ3MuZ2VvZ3JhcGh5IH1cblxuICBpZiAodHlwZW9mIHRhYmxlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZmllbGQgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBnZW9ncmFwaHkgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb25zb2xlLmxvZygndGhyb3cgZXJyb3InKVxuICB9XG5cbiAgZ2V0X2xheWVyKHtcbiAgICAgIHRhYmxlOiAgICAgdGFibGVcbiAgICAsIGZpZWxkOiAgICAgZmllbGRcbiAgICAsIGdlb2dyYXBoeTogZ2VvZ3JhcGh5XG4gICAgLCBwb2x5Z29uOiAgIEwucmVjdGFuZ2xlKCBtYXAuZ2V0Qm91bmRzKCkgKS50b0dlb0pTT04oKVxuICAgICwgYWRkX3RvOiAgICBleHRlbnRfbGF5ZXIgfSlcbn1cblxuXG52YXIgc2V0X3N0dWR5X2FyZWEgPSBmdW5jdGlvbihhcmdzKXtcbiAgY29uc29sZS5sb2coJ2dsb2JhbCNzZXRfc3R1ZHlfYXJlYScpXG4gIGlmKCBhcmdzLnRhYmxlICkgICAgICB7IHRhYmxlICAgICAgPSBhcmdzLnRhYmxlIH1cbiAgaWYoIGFyZ3MuZmllbGQgKSAgICAgIHsgZmllbGQgICAgICA9IGFyZ3MuZmllbGQgfVxuICBpZiggYXJncy5nZW9ncmFwaHkgKSAgeyBnZW9ncmFwaHkgID0gYXJncy5nZW9ncmFwaHkgfVxuICBpZiggYXJncy5zdHVkeV9hcmVhICkgeyBzdHVkeV9hcmVhID0gYXJncy5zdHVkeV9hcmVhIH1cblxuICBpZiAodHlwZW9mIHRhYmxlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZmllbGQgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBnZW9ncmFwaHkgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb25zb2xlLmxvZygndGhyb3cgZXJyb3InKVxuICB9XG5cbiAgc3R1ZHlfbGF5ZXIuYWRkTGF5ZXIoIHN0dWR5X2FyZWEgKVxuXG4gIGdldF9sYXllcih7XG4gICAgICB0YWJsZTogICAgIHRhYmxlXG4gICAgLCBmaWVsZDogICAgIGZpZWxkXG4gICAgLCBnZW9ncmFwaHk6IGdlb2dyYXBoeVxuICAgICwgcG9seWdvbjogICBzdHVkeV9hcmVhLnRvR2VvSlNPTigpXG4gICAgLCBhZGRfdG86ICAgIHN0dWR5X2xheWVyIH0pIFxufVxuXG52YXIgZ2V0X3RhYmxlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGFibGUgfVxuXG52YXIgaGFzX3N0dWR5X2FyZWEgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2Ygc3R1ZHlfYXJlYSAhPSAndW5kZWZpbmVkJykgeyByZXR1cm4gdHJ1ZSB9XG4gIHJldHVybiBmYWxzZSB9XG5cblxuLy8gcHVibGljIGludGVyZmFjZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0X21hcDogICAgICAgaW5pdF9tYXBcbiAgLCBlc3RhYmxpc2hfbWFwOiAgZXN0YWJsaXNoX21hcFxuICAsIHNldF9vdmVybGF5OiAgICBzZXRfb3ZlcmxheVxuICAsIHNldF9zdHVkeV9hcmVhOiBzZXRfc3R1ZHlfYXJlYVxuICAsIGhhc19zdHVkeV9hcmVhOiBoYXNfc3R1ZHlfYXJlYSB9XG5cblxuXG4vLyBwcml2YXRlXG5cbnZhciBnZXRfbGF5ZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gIGNvbnNvbGUubG9nKCdnbG9iYWwjZ2V0X2xheWVyJylcbiAgXG4gIC8vIGFyZ3MuZ2VvZ3JhcGh5ID0gJ21hX2NlbnN1c190cmFjdHMnXG5cbiAgdmFyIGJhc2VfdXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MjQ3NC9nZW9ncmFwaGljL3NwYXRpYWwvJ1xuICAgICwgdXJsID0gYmFzZV91cmwgKyBhcmdzLmdlb2dyYXBoeSArICcvdGFidWxhci8nICsgYXJncy50YWJsZSArICcvJyArIGZpZWxkICsgJy9pbnRlcnNlY3QnXG4gICAgLCBwb2x5Z29uID0gYXJncy5wb2x5Z29uXG5cbiAgY29uc29sZS5sb2codXJsKVxuXG4gICQuYWpheCh7XG4gICAgICB1cmw6IHVybFxuICAgICwgdHlwZTogJ1BPU1QnXG4gICAgLCBkYXRhOiBhcmdzLnBvbHlnb24uZ2VvbWV0cnlcbiAgICAsIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdnbG9iYWwjZ2V0X2xheWVyOiBzdWNjZXNzLiBOb3csIHRoZSBkYXRhOicpXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpIFxuICAgICAgICBhcmdzLmFkZF90by5jbGVhckxheWVycygpXG4gICAgICAgIGFyZ3MuYWRkX3RvLmFkZExheWVyKCBMLmdlb0pzb24oZGF0YSkgKVxuICAgICAgfVxuICAgICwgZXJyb3I6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUlwiKVxuICAgICAgICBjb25zb2xlLmxvZyhlKSB9IH0pXG59IiwiLypcbiAgXG4gIE1lZGlhdG9yIGltcGxlbWVudGF0aW9uXG4gIGJ5IEFkZHkgT3NtYW5pXG4gIGh0dHA6Ly9hZGR5b3NtYW5pLmNvbS9sYXJnZXNjYWxlamF2YXNjcmlwdC9cblxuKi9cblxudmFyIG1lZGlhdG9yID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBzdWJzY3JpYmUgPSBmdW5jdGlvbihjaGFubmVsLCBmbil7XG4gICAgaWYgKCFtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXSkgbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF0gPSBbXTtcbiAgICBtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXS5wdXNoKHsgY29udGV4dDogdGhpcywgY2FsbGJhY2s6IGZuIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuIFxuICBwdWJsaXNoID0gZnVuY3Rpb24oY2hhbm5lbCl7XG4gICAgaWYgKCFtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXSkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IG1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdW2ldO1xuICAgICAgc3Vic2NyaXB0aW9uLmNhbGxiYWNrLmFwcGx5KHN1YnNjcmlwdGlvbi5jb250ZXh0LCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gXG4gIHJldHVybiB7XG4gICAgY2hhbm5lbHM6IHt9LFxuICAgIHB1Ymxpc2g6IHB1Ymxpc2gsXG4gICAgc3Vic2NyaWJlOiBzdWJzY3JpYmUsXG4gICAgaW5zdGFsbFRvOiBmdW5jdGlvbihvYmope1xuICAgICAgb2JqLnN1YnNjcmliZSA9IHN1YnNjcmliZTtcbiAgICAgICBvYmoucHVibGlzaCA9IHB1Ymxpc2g7XG4gICAgfVxuICB9O1xuXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWVkaWF0b3I6IG1lZGlhdG9yIH0iLCJ2YXIgYXBpX2Jhc2UgPSAnaHR0cDovL2xvY2FsaG9zdDoyNDc0J1xuXG52YXIgbWV0YSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gY29uc29sZS5sb2coJ1F1ZXJ5TWFuYWdlciNtZXRhIHdpdGggYXJnczogJylcbiAgLy8gY29uc29sZS5sb2coYXJndW1lbnRzKVxuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKFthcmdzLmxlbmd0aC0xXSlcbiAgcXVlcnlfcGF0aCA9ICcvJyArIGFyZ3Muam9pbihcIi9cIilcbiAgcmVxdWVzdCh7IFxuICAgIHBhdGg6IHF1ZXJ5X3BhdGgsXG4gICAgY2FsbGJhY2s6IGNhbGxiYWNrIH0pXG59XG5cbnZhciByZXF1ZXN0ID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgY2FsbGJhY2sgPSBhcmdzWydjYWxsYmFjayddXG4gIC8vIGNvbnNvbGUubG9nKCdRdWVyeU1hbmFnZXIjcmVxdWVzdCB3aXRoIGFyZ3M6ICcpXG4gIC8vIGNvbnNvbGUubG9nKGFyZ3MpXG4gIHZhciBiYXNlID0gYXJnc1snYXBpX2Jhc2UnXSAgIHx8IGFwaV9iYXNlXG4gICAgLCBwYXRoID0gYXJnc1sncGF0aCddICAgICAgIHx8ICcvJ1xuICAgICwgb3B0cyA9IGFyZ3NbJ3F1ZXJ5X2FyZ3MnXSB8fCAnJ1xuICAgICwgdHlwZSA9IGFyZ3NbJ21ldGhvZCddICAgICB8fCAnR0VUJ1xuICAgICwgZGF0YSA9IGFyZ3NbJ2RhdGEnXSAgICAgICB8fCBudWxsXG5cbiAgdmFyIHVybCA9IGJhc2UgKyBwYXRoICsgb3B0c1xuICAvLyBjb25zb2xlLmxvZygndXJsOicgKyB1cmwpXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6IHVybCxcbiAgICB0eXBlOiB0eXBlLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyggJ1NVQ0NFU1M6ICcgKVxuICAgICAgLy8gY29uc29sZS5sb2coIGRhdGEgKVxuICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhkYXRhKVxuICAgICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKCAnRVJST1I6ICcgKVxuICAgICAgY29uc29sZS5sb2coIGUgKSB9XG4gIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBtZXRhOiBtZXRhIH0iLCJ2YXIgRGF0YU1hbmFnZXIgPSByZXF1aXJlKCcuL2RhdGFfbWFuYWdlcicpXG5cbi8vIFNlbGVjdE1hbmFnZXIuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbi8vICAgdmFyIHRvcGljICAgICA9ICQoJ3NlbGVjdCN0b3BpYycpXG4vLyAgICAgLCB0YWJsZSAgICAgPSAkKCdzZWxlY3QjdGFibGUnKVxuLy8gICAgICwgZmllbGQgICAgID0gJCgnc2VsZWN0I2ZpZWxkJylcbi8vICAgICAsIGdlb2dyYXBoeSA9ICQoJ3NlbGVjdCNnZW9ncmFwaHknKVxuLy8gICAgICwgc2VsZWN0cyA9IFt0b3BpYywgdGFibGUsIGZpZWxkLCBnZW9ncmFwaHldXG5cbi8vICAgXy5mb3JFYWNoKHNlbGVjdHMsIGZ1bmN0aW9uIChzZWxlY3QpIHtcbi8vICAgICBTZWxlY3RNYW5hZ2VyLnBvcHVsYXRlKCBzZWxlY3QsICApXG4vLyAgIH0pXG4vLyB9XG5cbi8vIFNlbGVjdE1hbmFnZXIudXBkYXRlX2NvbnRyb2xzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbi8vICAgY29uc29sZS5sb2coJ1NlbGVjdE1hbmFnZXIjdXBkYXRlX2NvbnRyb2xzIHdpdGggYXJnczogJyArIGFyZ3MpXG4vLyAgIFNlbGVjdE1hbmFnZXIucG9wdWxhdGUoeyBlbGVtZW50OiBhcmdzWyd0b191cGRhdGUnXVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICwgdXNpbmc6ICAgYXJnc1snc2VsZWN0ZWQnXVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICwgZnJvbTogICAgYXJnc1snY2hhbmdlZCddIFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuXG4vLyB2YXIgcG9wdWxhdGVfbmV4dCA9IGZ1bmN0aW9uKClcblxuLy8gU2VsZWN0TWFuYWdlci5wb3B1bGF0ZSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4vLyAgIGNvbnNvbGUubG9nKCdTZWxlY3RNYW5hZ2VyI3BvcHVsYXRlIHdpdGggYXJnczogJyArIGFyZ3MpXG4vLyAgIHZhciBlbGVtZW50ID0gYXJnc1snZWxlbWVudCddICAgLy8gdGFibGUgc2VsZWN0XG4vLyAgICAgLCB1c2luZyAgID0gYXJnc1sndXNpbmcnXSAgICAgLy8gdG9waWMgb3B0aW9uXG4vLyAgICAgLCBjaGFuZ2VkID0gYXJnc1snY2hhbmdlZCddICAgLy8gdG9waWMgc2VsZWN0XG4vLyAgIC8vIGdldCggJ3RhYmxlJywgJ3RvcGljJywgJ3RyYW5zcG9ydGF0aW9uJyApXG4vLyAgIHZhciBwYWlycyA9IERhdGFNYW5hZ2VyLmdldCh7IGRhdGE6IGVsZW1lbnQuaWQsIGZyb206IGNoYW5nZWQuaWQsIHVzaW5nOiB1c2luZy52YWx1ZSB9KVxuLy8gICB2YXIgb3B0aW9ucyA9IFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhwYWlycywgeyBwbGFjZWhvbGRlcjogJ1NlbGVjdCcgKyBlbGVtZW50LmlkIH0pXG4vLyAgIGVsZW1lbnQuaHRtbChvcHRpb25zKSB9XG5cblxudmFyIGdlbmVyYXRlX29wdGlvbnMgPSBmdW5jdGlvbiAocGFpcnMsIG9wdHMpIHtcbiAgdmFyIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgLCBwbGFjZWhvbGRlciA9IG9wdHNbJ3BsYWNlaG9sZGVyJ10gfHwgXCJDaG9vc2Ugb25lXCJcbiAgICAsIHRleHQgPSBvcHRzWyd0ZXh0J11cbiAgICAsIHZhbHVlID0gb3B0c1sndmFsdWUnXVxuICAgICwgb3B0aW9ucyA9IFtdXG4gIGNvbnNvbGUubG9nKFwicGFpcnNcIilcbiAgY29uc29sZS5sb2cocGFpcnMpXG4gIGNvbnNvbGUubG9nKCd0ZXh0OicrIHRleHQgKycsIHZhbHVlOicgKyB2YWx1ZSlcbiAgaWYgKF8uaXNTdHJpbmcocGFpcnNbMF0pKSB7XG4gICAgcGFpcnMgPSBwYWlyc19mcm9tX2FycmF5KHBhaXJzKSB9XG4gIGVsc2UgaWYgKF8uaXNPYmplY3QocGFpcnNbMF0pKSB7XG4gICAgcGFpcnMgPSBwYWlyc19mcm9tX29iamVjdHMoeyBvYmplY3RzOiBwYWlycywgdGV4dDogdGV4dCwgdmFsdWU6IHZhbHVlIH0pIFxuICAgIC8vIGNvbnNvbGUubG9nKHBhaXJzKSBcbiAgfVxuXG5cbiAgb3B0aW9ucy5wdXNoKCc8b3B0aW9uIHZhbHVlPVwiXCI+JyArIHBsYWNlaG9sZGVyICsgJzwvb3B0aW9uPicpXG4gIG9wdGlvbnMucHVzaCggb3B0aW9uc19mcm9tX2hhc2gocGFpcnMsIG9wdHMpIClcbiAgcmV0dXJuIG9wdGlvbnMuam9pbihcIlxcblwiKSB9XG5cblxudmFyIHBhaXJzX2Zyb21fYXJyYXkgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgdmFyIHBhaXJzID0ge31cbiAgXy5mb3JFYWNoKGFycmF5LCBmdW5jdGlvbihlbGVtZW50KSB7IHBhaXJzW2VsZW1lbnRdID0gZWxlbWVudCB9KVxuICByZXR1cm4gcGFpcnMgfVxuXG5cbnZhciBwYWlyc19mcm9tX29iamVjdHMgPSBmdW5jdGlvbiAoYXJncykge1xuICB2YXIgb2JqZWN0cyA9IGFyZ3NbJ29iamVjdHMnXVxuICAgICwgdGV4dCAgICA9IGFyZ3NbJ3RleHQnXVxuICAgICwgdmFsdWUgICA9IGFyZ3NbJ3ZhbHVlJ11cbiAgICAsIHBhaXJzICAgPSBbXVxuXG4gIF8uZm9yRWFjaChvYmplY3RzLCBmdW5jdGlvbihvYmplY3QpIHsgXG4gICAgcGFpcnNbb2JqZWN0W3RleHRdXSA9IG9iamVjdFt2YWx1ZV0gfSlcblxuICByZXR1cm4gcGFpcnMgfVxuXG5cbnZhciBvcHRpb25zX2Zyb21faGFzaCA9IGZ1bmN0aW9uIChwYWlycywgb3B0cykge1xuICB2YXIgb3B0aW9ucyA9IFtdXG4gICAgLCBzZWxlY3RlZCA9ICcnXG4gIF8uZm9ySW4ocGFpcnMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgIG9wdGlvbnMucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicrIHZhbHVlICsnXCIgJysgc2VsZWN0ZWQgKyc+Jysga2V5ICsnPC9vcHRpb24+JylcbiAgfSk7XG4gIHJldHVybiBvcHRpb25zXG59XG5cbnZhciBwb3B1bGF0ZV9uZXh0ID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgdmFsdWUgPSBvYmoudmFsKClcbiAgICAsIG5leHQgID0gb2JqLm5leHQoKVxuICAgICwgaWQgICAgPSBvYmouYXR0cignaWQnKVxuICAgICwgb3B0cyAgPSB7fVxuXG4gIC8vIGNvbnNvbGUubG9nKCdwb3B1bGF0ZV9uZXh0IHdpdGggJykgOyBjb25zb2xlLmxvZyggb2JqIClcbiAgLy8gY29uc29sZS5sb2coJ3ZhbHVlICcgKyB2YWx1ZSkgICAgICA7IGNvbnNvbGUubG9nKCdpZCAnICsgaWQpXG4gIC8vIGNvbnNvbGUubG9nKCduZXh0ICcpICAgICAgICAgICAgICAgOyBjb25zb2xlLmxvZyhuZXh0KVxuXG4gIHN3aXRjaCAoaWQpIHtcbiAgICBjYXNlICd0b3BpYyc6XG4gICAgICBvcHRzID0ge3RleHQ6ICd0aXRsZScsIHZhbHVlOiAnbmFtZSd9XG4gICAgICBEYXRhTWFuYWdlci5nZXRfdGFibGVzKHZhbHVlLCBmdW5jdGlvbiAocGFpcnMpIHtcbiAgICAgICAgbmV4dC5odG1sKCBnZW5lcmF0ZV9vcHRpb25zKHBhaXJzLCBvcHRzKSApXG4gICAgICB9KVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFibGUnOlxuICAgICAgb3B0cyA9IHt0ZXh0OiAnYWxpYXMnLCB2YWx1ZTogJ2ZpZWxkX25hbWUnfVxuICAgICAgRGF0YU1hbmFnZXIuZ2V0X2ZpZWxkcyh7IHRhYmxlOiB2YWx1ZSwgY2FsbGJhY2s6IGZ1bmN0aW9uIChwYWlycykge1xuICAgICAgICBuZXh0Lmh0bWwoIGdlbmVyYXRlX29wdGlvbnMocGFpcnMsIG9wdHMpIClcbiAgICAgIH19KVxuICAgICAgb3B0c19nZW8gPSB7dGV4dDogJ3RpdGxlJywgdmFsdWU6ICduYW1lJ31cbiAgICAgIERhdGFNYW5hZ2VyLmdldF9nZW9ncmFwaGllcyh7dGFibGU6IHZhbHVlLCBjYWxsYmFjazogZnVuY3Rpb24gKHBhaXJzKSB7XG4gICAgICAgIG5leHQubmV4dCgpLmh0bWwoIGdlbmVyYXRlX29wdGlvbnMocGFpcnMsIG9wdHNfZ2VvKSApXG4gICAgICB9fSlcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2VuZXJhdGVfb3B0aW9uczogIGdlbmVyYXRlX29wdGlvbnNcbiAgLCBwb3B1bGF0ZV9uZXh0OiBwb3B1bGF0ZV9uZXh0XG59IiwiXG52YXIgem9vbV9jb25maWcgPSB7XG4gICAgICA4OiAgJ211bmljaXBhbGl0eSdcbiAgICAsIDEyOiBbJ2NlbnN1c190cmFjdCcsICdzY2hvb2xfZGlzdHJpY3QnXVxuICAgICwgMTU6ICdjZW5zdXNfYmxvY2tncm91cCcgfVxuXG5cbnZhciBhcnJheWlmeSA9IGZ1bmN0aW9uIChoYXNoKSB7XG4gIGNvbnNvbGUubG9nKCdab29tTWFuYWdlciNhcnJheWlmeScpXG4gIHZhciBtYXggICA9IF8ubWF4KCBfLm1hcChfLmtleXMoaGFzaCksIGZ1bmN0aW9uIChlKSB7IHJldHVybiBfLnBhcnNlSW50KGUpIH0gKSlcbiAgICAsIGFycmF5ID0gQXJyYXkobWF4KSAvLyBUT0RPOiBvciwgbWFwLm1heFpvb20oKVxuXG4gIF8uZWFjaChoYXNoLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgYXJyYXlba2V5XSA9IHZhbHVlIH0pXG4gIGNvbnNvbGUubG9nKGFycmF5KVxuICByZXR1cm4gYXJyYXlcbn1cblxudmFyIHpvb21fYXJyYXkgPSBhcnJheWlmeSh6b29tX2NvbmZpZykgXG5cbnZhciBhcHByb3ByaWF0ZV9zdW1sZXYgPSBmdW5jdGlvbiAobWFwLCBzdW1sZXZzKSB7XG4gIHZhciByZXR1cm5fdmFsdWVcbiAgY29uc29sZS5sb2coJ1pvb21NYW5hZ2VyI2FwcHJvcHJpYXRlX3N1bWxldicpXG4gIC8vIHJldHVybnMgYSB2YWx1ZSBsaWtlICdjZW5zdXNfYmxvY2tncm91cCdcbiAgXG4gIC8vIHN0YXJ0cyBhdCBjdXJyZW50IHpvb20sIHVubGVzcyB0aGF0J3MgdG9vIGhpZ2hcbiAgdmFyIHN0YXJ0X3pvb20gPSBtYXAuZ2V0Wm9vbSgpXG4gIGlmICggc3RhcnRfem9vbSA+IHpvb21fYXJyYXkubGVuZ3RoICkgc3RhcnRfem9vbSA9IHpvb21fYXJyYXkubGVuZ3RoXG5cbiAgLy8gY29uc29sZS5sb2coJ3N0YXJ0IHpvb206ICcgKyBzdGFydF96b29tKVxuICAvLyB3b3JrIGJhY2sgZnJvbSBjbG9zZXN0IHRvIGZhcnRoZXN0XG4gIGZvciAodmFyIHpvb20gPSBzdGFydF96b29tOyB6b29tID4gLTE7IHpvb20tLSl7XG4gICAgb3B0aW9ucyA9IHpvb21fYXJyYXlbem9vbV0gIC8vIHJldDogJ2NlbnN1c19ibG9ja3MnIG9yIFsnY3QnLCAnc2QnXVxuICAgIGlmICghIF8uaXNBcnJheShvcHRpb25zKSkgb3B0aW9ucyA9IFtvcHRpb25zXSAvLyBmb3JjZSB0byBiZSBBcnJheVxuXG4gICAgXy5lYWNoKG9wdGlvbnMsIGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgLy8gY29uc29sZS5sb2coJ29wdGlvbjogJyArIG9wdGlvbilcbiAgICAgIGlmICh0eXBlb2YgcmV0dXJuX3ZhbHVlICE9ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsc2VcbiAgICAgIF8uZm9ySW4oc3VtbGV2cywgZnVuY3Rpb24gKHN1bWxldiwga2V5KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdzdW1sZXY6ICcgKyBzdW1sZXYubmFtZSlcbiAgICAgICAgaWYgKHN1bWxldi5uYW1lID09PSBvcHRpb24pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUkVUVVJOSU5HICcgKyBzdW1sZXYubmFtZSlcbiAgICAgICAgICByZXR1cm5fdmFsdWUgPSBzdW1sZXYubmFtZVxuICAgICAgICB9XG4gICAgICB9KSAgXG4gICAgfSlcbiAgfVxuICBjb25zb2xlLmxvZygncmV0dXJuX3ZhbHVlOiAnICsgcmV0dXJuX3ZhbHVlKVxuICByZXR1cm4gcmV0dXJuX3ZhbHVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhcHByb3ByaWF0ZV9zdW1sZXY6IGFwcHJvcHJpYXRlX3N1bWxldlxufSJdfQ==
;