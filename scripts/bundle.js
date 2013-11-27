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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL2RhdGFfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWFpbi5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWFwX21hbmFnZXIuanMiLCIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL21lZGlhdG9yLmpzIiwiL1VzZXJzL21hcGN1c2VyL1Byb2plY3RzL25laWdoYm9yaG9vZC1kcmF3aW5nLXRvb2wvc2NyaXB0cy9xdWVyeV9tYW5hZ2VyLmpzIiwiL1VzZXJzL21hcGN1c2VyL1Byb2plY3RzL25laWdoYm9yaG9vZC1kcmF3aW5nLXRvb2wvc2NyaXB0cy9zZWxlY3RfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvem9vbV9tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBRdWVyeU1hbmFnZXIgPSByZXF1aXJlKCcuL3F1ZXJ5X21hbmFnZXInKVxuXG52YXIgZ2V0X3RvcGljcyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0X3RvcGljcycpXG4gIHZhciBjYXRlZ29yaWVzID0gW11cblxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsICdsaXN0JywgJ3ZlcmJvc2UnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIC8vIGNvbnNvbGUubG9nKCAnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBkYXRhOiAnICsgZGF0YSApXG4gICAgXG4gICAgXy5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgY2F0ZWdvcmllcy5wdXNoKHRhYmxlWydjYXRlZ29yeSddKSB9KVxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggXy51bmlxdWUoY2F0ZWdvcmllcykgKSB9XG4gIH0pXG59XG5cblxudmFyIGdldF90YWJsZXMgPSBmdW5jdGlvbiAoY2F0ZWdvcnksIGNhbGxiYWNrKSB7XG4gIC8vIGNvbnNvbGUubG9nKCAnRGF0YU1hbmFnZXIjZ2V0X3RhYmxlcycgKVxuICB2YXIgdGFibGVzID0gW11cblxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsICdsaXN0JywgJ3ZlcmJvc2UnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIC8vIGNvbnNvbGUubG9nKCAnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBkYXRhOiAnICsgZGF0YSApXG4gICAgXy5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgaWYgKCB0YWJsZVsnY2F0ZWdvcnknXSA9PT0gY2F0ZWdvcnkgKXtcbiAgICAgICAgdGFibGVzLnB1c2goIHRhYmxlIClcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayh0YWJsZXMpIH1cbiAgfSlcbn1cblxuXG52YXIgZ2V0X2ZpZWxkcyA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdEYXRhTWFuYWdlciNnZXRfZmllbGRzJylcbiAgdmFyIHRhYmxlICAgID0gYXJnc1sndGFibGUnXSxcbiAgICAgIGNhbGxiYWNrID0gYXJnc1snY2FsbGJhY2snXVxuICBcbiAgUXVlcnlNYW5hZ2VyLm1ldGEoJ3RhYnVsYXInLCB0YWJsZSwgJ21ldGEnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggZGF0YS5hdHRyaWJ1dGVzICkgfVxuICB9KVxufVxuXG52YXIgZ2V0X2dlb2dyYXBoaWVzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgLy8gY29uc29sZS5sb2coJ0RhdGFNYW5hZ2VyI2dldF9maWVsZHMnKVxuICB2YXIgdGFibGUgICAgPSBhcmdzWyd0YWJsZSddLFxuICAgICAgY2FsbGJhY2sgPSBhcmdzWydjYWxsYmFjayddXG4gIFxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsIHRhYmxlLCAnbWV0YScsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKCBkYXRhLnN1bW1hcnlfbGV2ZWxzICkgfVxuICB9KVxufVxuXG5cbnZhciBnZXQgPSBmdW5jdGlvbiAoYXJncykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0JylcbiAgLy8gY29uc29sZS5sb2coJ0dFVCcrIGFyZ3NbJ2RhdGEnXSArJyB3aGVyZSAnKyBhcmdzWydmcm9tJ10gKycgPSAnKyBhcmdzWyd1c2luZyddICsnLicgKVxufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0X3RvcGljczogIGdldF90b3BpY3NcbiAgLCBnZXRfdGFibGVzOiAgZ2V0X3RhYmxlc1xuICAsIGdldF9maWVsZHM6ICBnZXRfZmllbGRzXG4gICwgZ2V0X2dlb2dyYXBoaWVzOiBnZXRfZ2VvZ3JhcGhpZXMgXG59IiwiLy8gVE9ETyBzZXQgdXAgalF1ZXJ5IGRvY3VtZW50IHJlYWR5XG4vLyBUT0RPIHNldCB1cCBtYXBcblxuY29uc29sZS5sb2coJ05EVCcpXG5cbnZhciBNZWRpYXRvciAgICAgID0gcmVxdWlyZSgnLi9tZWRpYXRvcicpLm1lZGlhdG9yXG5cbnZhciBRdWVyeU1hbmFnZXIgID0gcmVxdWlyZSgnLi9xdWVyeV9tYW5hZ2VyJylcbnZhciBEYXRhTWFuYWdlciAgID0gcmVxdWlyZSgnLi9kYXRhX21hbmFnZXInKVxudmFyIFNlbGVjdE1hbmFnZXIgPSByZXF1aXJlKCcuL3NlbGVjdF9tYW5hZ2VyJylcbnZhciBNYXBNYW5hZ2VyICAgID0gcmVxdWlyZSgnLi9tYXBfbWFuYWdlcicpXG52YXIgWm9vbU1hbmFnZXIgICA9IHJlcXVpcmUoJy4vem9vbV9tYW5hZ2VyJylcblxuXG5EYXRhTWFuYWdlci5nZXRfdG9waWNzKCBmdW5jdGlvbiAodG9waWNzKSB7XG4gICQoJ3NlbGVjdCN0b3BpYycpLmh0bWwoXG4gICAgU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHRvcGljcykgKSAgfSlcblxuXG4kKCdzZWxlY3QnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gIFNlbGVjdE1hbmFnZXIucG9wdWxhdGVfbmV4dCggJCh0aGlzKSApIH0pXG5cblxuJCgnc2VsZWN0I2ZpZWxkJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZpZWxkID0gJCh0aGlzKS52YWwoKVxuICB2YXIgZ2VvID0gJCgnc2VsZWN0I2dlb2dyYXBoeSBvcHRpb24nKVsxXSxcbiAgICAgIGdlbyA9ICQoZ2VvKVxuXG4gIGdlby5hdHRyKCdzZWxlY3RlZCcsIHRydWUpIC8vIHNlbGVjdCBmaXJzdCBnZW9ncmFwaHlcbiAgXG4gIGlmICggTWFwTWFuYWdlci5oYXNfc3R1ZHlfYXJlYSgpICkge1xuICAgIE1hcE1hbmFnZXIuc2V0X3N0dWR5X2FyZWEoe1xuICAgICAgdGFibGU6ICAgICAkKCdzZWxlY3QjdGFibGUnKS52YWwoKVxuICAgICwgZmllbGQ6ICAgICBmaWVsZFxuICAgICwgZ2VvZ3JhcGh5OiBnZW8udmFsKCkgfSlcbiAgfVxuXG4gIE1hcE1hbmFnZXIuc2V0X292ZXJsYXkoe1xuICAgICAgdGFibGU6ICAgICAkKCdzZWxlY3QjdGFibGUnKS52YWwoKVxuICAgICwgZmllbGQ6ICAgICBmaWVsZFxuICAgICwgZ2VvZ3JhcGh5OiBnZW8udmFsKCkgfSlcbn0pXG5cblxuJCgnc2VsZWN0I2dlb2dyYXBoeScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBnZW8gPSAkKHRoaXMpLmZpbmQoJzpzZWxlY3RlZCcpXG4gIGlmICggTWFwTWFuYWdlci5oYXNfc3R1ZHlfYXJlYSgpICkge1xuICAgIE1hcE1hbmFnZXIuc2V0X3N0dWR5X2FyZWEoeyBnZW9ncmFwaHk6IGdlby52YWwoKSB9KSB9XG4gIE1hcE1hbmFnZXIuc2V0X292ZXJsYXkoeyBnZW9ncmFwaHk6IGdlby52YWwoKSB9KSAgXG59KVxuXG5cblxuXG52YXIgbWFwID0gTWFwTWFuYWdlci5pbml0X21hcCgpXG5NYXBNYW5hZ2VyLmVzdGFibGlzaF9tYXAobWFwKVxuXG5cbm1hcC5vbignZHJhdzpjcmVhdGVkJywgZnVuY3Rpb24gKGRyYXdpbmcpIHtcbiAgTWFwTWFuYWdlci5zZXRfc3R1ZHlfYXJlYSh7IHN0dWR5X2FyZWE6IGRyYXdpbmcubGF5ZXIgfSkgIH0pXG5cblxubWFwLm9uKCdkcmF3OmVkaXRlZCcsIGZ1bmN0aW9uIChkcmF3aW5nKSB7XG4gIGNvbnNvbGUubG9nKCdkcmF3I2VkaXRlZCcpICB9KVxuXG5cbm1hcC5vbignbW92ZWVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgTWFwTWFuYWdlci5zZXRfb3ZlcmxheSh7fSkgIH0pXG5cblxubWFwLm9uKCd6b29tZW5kJywgZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyggJ3pvb206ICcgKyBtYXAuZ2V0Wm9vbSgpIClcblxuICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoc3VtbGV2cykge1xuICAgIGNvbnNvbGUubG9nKCdzdW1tYXJ5IGxldmVsczogJyArIHN1bWxldnMpXG4gICAgdmFyIHZhbHVlID0gWm9vbU1hbmFnZXIuYXBwcm9wcmlhdGVfc3VtbGV2KG1hcCwgc3VtbGV2cylcbiAgICBjb25zb2xlLmxvZyh2YWx1ZSlcbiAgICAkKFwic2VsZWN0I2dlb2dyYXBoeVwiKS52YWwodmFsdWUpXG4gICAgJChcInNlbGVjdCNnZW9ncmFwaHlcIikudHJpZ2dlcignY2hhbmdlJylcbiAgfVxuXG4gIHZhciB0YWJsZSA9ICQoJ3NlbGVjdCN0YWJsZScpLnZhbCgpXG4gIGNvbnNvbGUubG9nKCd0YWJsZTogJyArIHRhYmxlKVxuICBEYXRhTWFuYWdlci5nZXRfZ2VvZ3JhcGhpZXMoe1xuICAgIHRhYmxlOiB0YWJsZSxcbiAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgfSlcbn0pXG5cblxuXG5cblxuXG5cblxuXG4vLyBtYXAub24oICdsb2FkJywgZnVuY3Rpb24oKSAgICAgeyBNZWRpYXRvci5wdWJsaXNoKCAnbWFwX2xvYWRlZCAnKSB9IClcbi8vIG1hcC5vbiggJ21vdmVlbmQnLCBmdW5jdGlvbiAoKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdtYXBfbW92ZWQnICkgfSApXG4vLyBtYXAub24oICd6b29tZW5kJywgZnVuY3Rpb24gKCkgeyBNZWRpYXRvci5wdWJsaXNoKCAnbWFwX3pvb21lZCcgKSB9IClcblxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnbWFwX2xvYWRlZCcsIE1hcE1hbmFnZXIuaW5pdCgpIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ21hcF9tb3ZlZCcsICBNYXBNYW5hZ2VyLmhhbmRsZV9tb3ZlKCkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnbWFwX3pvb21lZCcsIE1hcE1hbmFnZXIuaGFuZGxlX3pvb20oKSApXG5cblxuLy8gbWFwLm9uKCAnZHJhdzpjcmVhdGUnLCAgZnVuY3Rpb24gKGRyYXdpbmcpIHsgTWVkaWF0b3IucHVibGlzaCggJ2ZpZ3VyZV9kcmF3bicgKSB9IClcbi8vIG1hcC5vbiggJ2RyYXc6ZWRpdGVkJywgIGZ1bmN0aW9uIChkcmF3aW5nKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdmaWd1cmVfZWRpdGVkJyApIH0gKVxuLy8gbWFwLm9uKCAnZHJhdzpkZWxldGVkJywgZnVuY3Rpb24gKCkgeyBNZWRpYXRvci5wdWJsaXNoKCAnZmlndXJlX2RlbGV0ZWQnICkgfSApXG5cbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9kcmF3bicsICAgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZHJhdyggZHJhd2luZyApIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9lZGl0ZWQnLCAgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZWRpdCggZHJhd2luZyApIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9kZWxldGVkJywgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZGVsZXRlKCkgKVxuXG5cbi8vICQoJ3NlbGVjdCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4vLyAgIHZhciBzZWxmICA9ICQodGhpcyksXG4vLyAgICAgICB2YWx1ZSA9IHNlbGYudmFsKCkgLy8gVE9ETyBvciBzb21ldGhpbmcgbGlrZSB0aGlzXG4vLyAgIGlmIChzZWxmLmlkID09PSAnZmllbGQnKSB7XG4vLyAgICAgTWVkaWF0b3IucHVibGlzaCAoICdmaWVsZF9jaGFuZ2VkJywgdmFsdWUgKVxuLy8gICB9IGVsc2Uge1xuLy8gICAgIE1lZGlhdG9yLnB1Ymxpc2goICdzZWxlY3RfY2hhbmdlZCcsIHtzZWxmOiBzZWxmLCBuZXh0OiBzZWxmLm5leHQoKSwgdmFsdWU6IHZhbHVlfSApIH1cbi8vIH0pXG5cbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ3NlbGVjdF9jaGFuZ2VkJywgU2VsZWN0TWFuYWdlci5wb3B1bGF0ZV9uZXh0KCBhcmdzICkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnZmllbGRfY2hhbmdlZCcsICBNYXBNYW5hZ2VyLmNoYW5nZV9maWVsZCggZmllbGQgKSApXG4iLCJcbnZhciB0YWJsZSwgZmllbGQsIGdlb2dyYXBoeSwgc3R1ZHlfYXJlYVxuICAsIG1hcGNfdXJsICAgICA9ICdodHRwOi8vdGlsZXMubWFwYy5vcmcvYmFzZW1hcC97en0ve3h9L3t5fS5wbmcnXG4gICwgbWFwY19hdHRyaWIgID0gJ1RpbGVzIGJ5IDxhIGhyZWY9XCJodHRwOi8vd3d3Lm1hcGMub3JnL1wiPk1ldHJvcG9saXRhbiBBcmVhIFBsYW5uaW5nIENvdW5jaWw8L2E+LidcbiAgLCB0aWxlcyAgICAgICAgPSBMLnRpbGVMYXllciggbWFwY191cmwsIHsgYXR0cmlidXRpb246IG1hcGNfYXR0cmliIH0gKVxuICAsIGV4dGVudF9sYXllciA9IG5ldyBMLmxheWVyR3JvdXAoKVxuICAsIHN0dWR5X2xheWVyICA9IG5ldyBMLmZlYXR1cmVHcm91cCgpXG4gICwgYmFzZV9sYXllcnMgID0geyBcbiAgICAgIFwiTUFQQyBCYXNlbWFwXCI6IHRpbGVzIH1cbiAgLCBvdmVyX2xheWVycyAgPSB7XG4gICAgICBcIk1hcCBFeHRlbnRcIjogZXh0ZW50X2xheWVyLFxuICAgICAgXCJTdHVkeSBBcmVhXCI6IHN0dWR5X2xheWVyIH1cblxudmFyIGxheWVyX2NvbnRyb2wgPSBMLmNvbnRyb2wubGF5ZXJzKGJhc2VfbGF5ZXJzLCBvdmVyX2xheWVycylcbiAgLCBkcmF3X2NvbnRyb2wgPSBuZXcgTC5Db250cm9sLkRyYXcoe1xuICAgICAgZHJhdzoge1xuICAgICAgICBwb3NpdGlvbjogJ3RvcGxlZnQnLFxuICAgICAgICBwb2x5Z29uOiB7XG4gICAgICAgICAgdGl0bGU6ICdEcmF3IHlvdXIgbmVpZ2hib3Job29kIScsXG4gICAgICAgICAgYWxsb3dJbnRlcnNlY3Rpb246IGZhbHNlLFxuICAgICAgICAgIGRyYXdFcnJvcjoge1xuICAgICAgICAgICAgY29sb3I6ICcjYjAwYjAwJyxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAgfSxcbiAgICAgICAgICBzaGFwZU9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNvbG9yOiAnIzIyNTVCQicgfSxcbiAgICAgICAgICBzaG93QXJlYTogdHJ1ZSB9LFxuICAgICAgICBwb2x5bGluZTogZmFsc2UsXG4gICAgICAgIG1hcmtlcjogZmFsc2UgfSxcbiAgICAgIGVkaXQ6IHtcbiAgICAgICAgZmVhdHVyZUdyb3VwOiBzdHVkeV9sYXllciB9IH0pO1xuXG52YXIgbWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICAgIGNlbnRlcjogbmV3IEwuTGF0TG5nKDQyLjQsIC03MS44KVxuICAgICwgem9vbTogMTFcbiAgICAsIGxheWVyczogdGlsZXMgfSlcblxudmFyIGluaXRfbWFwID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbWFwXG59XG5cbnZhciBlc3RhYmxpc2hfbWFwID0gZnVuY3Rpb24gKG1hcCkge1xuICBleHRlbnRfbGF5ZXIuYWRkVG8obWFwKVxuICBzdHVkeV9sYXllci5hZGRUbyhtYXApXG4gIGxheWVyX2NvbnRyb2wuYWRkVG8obWFwKVxuICBtYXAuYWRkQ29udHJvbChkcmF3X2NvbnRyb2wpXG59XG5cblxudmFyIHNldF9vdmVybGF5ID0gZnVuY3Rpb24oYXJncykge1xuICBjb25zb2xlLmxvZygnZ2xvYmFsI3NldF9vdmVybGF5JylcbiAgaWYoIGFyZ3MudGFibGUgKSAgICAgeyB0YWJsZSAgICAgPSBhcmdzLnRhYmxlIH1cbiAgaWYoIGFyZ3MuZmllbGQgKSAgICAgeyBmaWVsZCAgICAgPSBhcmdzLmZpZWxkIH1cbiAgaWYoIGFyZ3MuZ2VvZ3JhcGh5ICkgeyBnZW9ncmFwaHkgPSBhcmdzLmdlb2dyYXBoeSB9XG5cbiAgaWYgKHR5cGVvZiB0YWJsZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGZpZWxkID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZ2VvZ3JhcGh5ID09PSAndW5kZWZpbmVkJyl7XG4gICAgY29uc29sZS5sb2coJ3Rocm93IGVycm9yJylcbiAgfVxuXG4gIGdldF9sYXllcih7XG4gICAgICB0YWJsZTogICAgIHRhYmxlXG4gICAgLCBmaWVsZDogICAgIGZpZWxkXG4gICAgLCBnZW9ncmFwaHk6IGdlb2dyYXBoeVxuICAgICwgcG9seWdvbjogICBMLnJlY3RhbmdsZSggbWFwLmdldEJvdW5kcygpICkudG9HZW9KU09OKClcbiAgICAsIGFkZF90bzogICAgZXh0ZW50X2xheWVyIH0pXG59XG5cblxudmFyIHNldF9zdHVkeV9hcmVhID0gZnVuY3Rpb24oYXJncyl7XG4gIGNvbnNvbGUubG9nKCdnbG9iYWwjc2V0X3N0dWR5X2FyZWEnKVxuICBpZiggYXJncy50YWJsZSApICAgICAgeyB0YWJsZSAgICAgID0gYXJncy50YWJsZSB9XG4gIGlmKCBhcmdzLmZpZWxkICkgICAgICB7IGZpZWxkICAgICAgPSBhcmdzLmZpZWxkIH1cbiAgaWYoIGFyZ3MuZ2VvZ3JhcGh5ICkgIHsgZ2VvZ3JhcGh5ICA9IGFyZ3MuZ2VvZ3JhcGh5IH1cbiAgaWYoIGFyZ3Muc3R1ZHlfYXJlYSApIHsgc3R1ZHlfYXJlYSA9IGFyZ3Muc3R1ZHlfYXJlYSB9XG5cbiAgaWYgKHR5cGVvZiB0YWJsZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGZpZWxkID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZ2VvZ3JhcGh5ID09PSAndW5kZWZpbmVkJyl7XG4gICAgY29uc29sZS5sb2coJ3Rocm93IGVycm9yJylcbiAgfVxuXG4gIHN0dWR5X2xheWVyLmFkZExheWVyKCBzdHVkeV9hcmVhIClcblxuICBnZXRfbGF5ZXIoe1xuICAgICAgdGFibGU6ICAgICB0YWJsZVxuICAgICwgZmllbGQ6ICAgICBmaWVsZFxuICAgICwgZ2VvZ3JhcGh5OiBnZW9ncmFwaHlcbiAgICAsIHBvbHlnb246ICAgc3R1ZHlfYXJlYS50b0dlb0pTT04oKVxuICAgICwgYWRkX3RvOiAgICBzdHVkeV9sYXllciB9KSBcbn1cblxudmFyIGdldF90YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRhYmxlIH1cblxudmFyIGhhc19zdHVkeV9hcmVhID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIHN0dWR5X2FyZWEgIT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuIHRydWUgfVxuICByZXR1cm4gZmFsc2UgfVxuXG5cbi8vIHB1YmxpYyBpbnRlcmZhY2VcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdF9tYXA6ICAgICAgIGluaXRfbWFwXG4gICwgZXN0YWJsaXNoX21hcDogIGVzdGFibGlzaF9tYXBcbiAgLCBzZXRfb3ZlcmxheTogICAgc2V0X292ZXJsYXlcbiAgLCBzZXRfc3R1ZHlfYXJlYTogc2V0X3N0dWR5X2FyZWFcbiAgLCBoYXNfc3R1ZHlfYXJlYTogaGFzX3N0dWR5X2FyZWEgfVxuXG5cblxuLy8gcHJpdmF0ZVxuXG52YXIgZ2V0X2xheWVyID0gZnVuY3Rpb24oYXJncykge1xuICBjb25zb2xlLmxvZygnZ2xvYmFsI2dldF9sYXllcicpXG4gIFxuICAvLyBhcmdzLmdlb2dyYXBoeSA9ICdtYV9jZW5zdXNfdHJhY3RzJ1xuXG4gIHZhciBiYXNlX3VybCA9ICdodHRwOi8vbG9jYWxob3N0OjI0NzQvZ2VvZ3JhcGhpYy9zcGF0aWFsLydcbiAgICAsIHVybCA9IGJhc2VfdXJsICsgYXJncy5nZW9ncmFwaHkgKyAnL3RhYnVsYXIvJyArIGFyZ3MudGFibGUgKyAnLycgKyBmaWVsZCArICcvaW50ZXJzZWN0J1xuICAgICwgcG9seWdvbiA9IGFyZ3MucG9seWdvblxuXG4gIGNvbnNvbGUubG9nKHVybClcblxuICAkLmFqYXgoe1xuICAgICAgdXJsOiB1cmxcbiAgICAsIHR5cGU6ICdQT1NUJ1xuICAgICwgZGF0YTogYXJncy5wb2x5Z29uLmdlb21ldHJ5XG4gICAgLCBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZ2xvYmFsI2dldF9sYXllcjogc3VjY2Vzcy4gTm93LCB0aGUgZGF0YTonKVxuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKSBcbiAgICAgICAgYXJncy5hZGRfdG8uY2xlYXJMYXllcnMoKVxuICAgICAgICBhcmdzLmFkZF90by5hZGRMYXllciggTC5nZW9Kc29uKGRhdGEpIClcbiAgICAgIH1cbiAgICAsIGVycm9yOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1JcIilcbiAgICAgICAgY29uc29sZS5sb2coZSkgfSB9KVxufSIsIi8qXG4gIFxuICBNZWRpYXRvciBpbXBsZW1lbnRhdGlvblxuICBieSBBZGR5IE9zbWFuaVxuICBodHRwOi8vYWRkeW9zbWFuaS5jb20vbGFyZ2VzY2FsZWphdmFzY3JpcHQvXG5cbiovXG5cbnZhciBtZWRpYXRvciA9IChmdW5jdGlvbigpe1xuICB2YXIgc3Vic2NyaWJlID0gZnVuY3Rpb24oY2hhbm5lbCwgZm4pe1xuICAgIGlmICghbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF0pIG1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdID0gW107XG4gICAgbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF0ucHVzaCh7IGNvbnRleHQ6IHRoaXMsIGNhbGxiYWNrOiBmbiB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiBcbiAgcHVibGlzaCA9IGZ1bmN0aW9uKGNoYW5uZWwpe1xuICAgIGlmICghbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF0pIHJldHVybiBmYWxzZTtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXVtpXTtcbiAgICAgIHN1YnNjcmlwdGlvbi5jYWxsYmFjay5hcHBseShzdWJzY3JpcHRpb24uY29udGV4dCwgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuIFxuICByZXR1cm4ge1xuICAgIGNoYW5uZWxzOiB7fSxcbiAgICBwdWJsaXNoOiBwdWJsaXNoLFxuICAgIHN1YnNjcmliZTogc3Vic2NyaWJlLFxuICAgIGluc3RhbGxUbzogZnVuY3Rpb24ob2JqKXtcbiAgICAgIG9iai5zdWJzY3JpYmUgPSBzdWJzY3JpYmU7XG4gICAgICAgb2JqLnB1Ymxpc2ggPSBwdWJsaXNoO1xuICAgIH1cbiAgfTtcblxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IG1lZGlhdG9yOiBtZWRpYXRvciB9IiwidmFyIGFwaV9iYXNlID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MjQ3NCdcblxudmFyIG1ldGEgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdRdWVyeU1hbmFnZXIjbWV0YSB3aXRoIGFyZ3M6ICcpXG4gIC8vIGNvbnNvbGUubG9nKGFyZ3VtZW50cylcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcChbYXJncy5sZW5ndGgtMV0pXG4gIHF1ZXJ5X3BhdGggPSAnLycgKyBhcmdzLmpvaW4oXCIvXCIpXG4gIHJlcXVlc3QoeyBcbiAgICBwYXRoOiBxdWVyeV9wYXRoLFxuICAgIGNhbGxiYWNrOiBjYWxsYmFjayB9KVxufVxuXG52YXIgcmVxdWVzdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgdmFyIGNhbGxiYWNrID0gYXJnc1snY2FsbGJhY2snXVxuICAvLyBjb25zb2xlLmxvZygnUXVlcnlNYW5hZ2VyI3JlcXVlc3Qgd2l0aCBhcmdzOiAnKVxuICAvLyBjb25zb2xlLmxvZyhhcmdzKVxuICB2YXIgYmFzZSA9IGFyZ3NbJ2FwaV9iYXNlJ10gICB8fCBhcGlfYmFzZVxuICAgICwgcGF0aCA9IGFyZ3NbJ3BhdGgnXSAgICAgICB8fCAnLydcbiAgICAsIG9wdHMgPSBhcmdzWydxdWVyeV9hcmdzJ10gfHwgJydcbiAgICAsIHR5cGUgPSBhcmdzWydtZXRob2QnXSAgICAgfHwgJ0dFVCdcbiAgICAsIGRhdGEgPSBhcmdzWydkYXRhJ10gICAgICAgfHwgbnVsbFxuXG4gIHZhciB1cmwgPSBiYXNlICsgcGF0aCArIG9wdHNcbiAgLy8gY29uc29sZS5sb2coJ3VybDonICsgdXJsKVxuXG4gICQuYWpheCh7XG4gICAgdXJsOiB1cmwsXG4gICAgdHlwZTogdHlwZSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgLy8gY29uc29sZS5sb2coICdTVUNDRVNTOiAnIClcbiAgICAgIC8vIGNvbnNvbGUubG9nKCBkYXRhIClcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZGF0YSlcbiAgICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ0VSUk9SOiAnIClcbiAgICAgIGNvbnNvbGUubG9nKCBlICkgfVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWV0YTogbWV0YSB9IiwidmFyIERhdGFNYW5hZ2VyID0gcmVxdWlyZSgnLi9kYXRhX21hbmFnZXInKVxuXG4vLyBTZWxlY3RNYW5hZ2VyLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4vLyAgIHZhciB0b3BpYyAgICAgPSAkKCdzZWxlY3QjdG9waWMnKVxuLy8gICAgICwgdGFibGUgICAgID0gJCgnc2VsZWN0I3RhYmxlJylcbi8vICAgICAsIGZpZWxkICAgICA9ICQoJ3NlbGVjdCNmaWVsZCcpXG4vLyAgICAgLCBnZW9ncmFwaHkgPSAkKCdzZWxlY3QjZ2VvZ3JhcGh5Jylcbi8vICAgICAsIHNlbGVjdHMgPSBbdG9waWMsIHRhYmxlLCBmaWVsZCwgZ2VvZ3JhcGh5XVxuXG4vLyAgIF8uZm9yRWFjaChzZWxlY3RzLCBmdW5jdGlvbiAoc2VsZWN0KSB7XG4vLyAgICAgU2VsZWN0TWFuYWdlci5wb3B1bGF0ZSggc2VsZWN0LCAgKVxuLy8gICB9KVxuLy8gfVxuXG4vLyBTZWxlY3RNYW5hZ2VyLnVwZGF0ZV9jb250cm9scyA9IGZ1bmN0aW9uIChhcmdzKSB7XG4vLyAgIGNvbnNvbGUubG9nKCdTZWxlY3RNYW5hZ2VyI3VwZGF0ZV9jb250cm9scyB3aXRoIGFyZ3M6ICcgKyBhcmdzKVxuLy8gICBTZWxlY3RNYW5hZ2VyLnBvcHVsYXRlKHsgZWxlbWVudDogYXJnc1sndG9fdXBkYXRlJ11cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAsIHVzaW5nOiAgIGFyZ3NbJ3NlbGVjdGVkJ11cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAsIGZyb206ICAgIGFyZ3NbJ2NoYW5nZWQnXSBcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIH0pIH1cblxuLy8gdmFyIHBvcHVsYXRlX25leHQgPSBmdW5jdGlvbigpXG5cbi8vIFNlbGVjdE1hbmFnZXIucG9wdWxhdGUgPSBmdW5jdGlvbiAoYXJncykge1xuLy8gICBjb25zb2xlLmxvZygnU2VsZWN0TWFuYWdlciNwb3B1bGF0ZSB3aXRoIGFyZ3M6ICcgKyBhcmdzKVxuLy8gICB2YXIgZWxlbWVudCA9IGFyZ3NbJ2VsZW1lbnQnXSAgIC8vIHRhYmxlIHNlbGVjdFxuLy8gICAgICwgdXNpbmcgICA9IGFyZ3NbJ3VzaW5nJ10gICAgIC8vIHRvcGljIG9wdGlvblxuLy8gICAgICwgY2hhbmdlZCA9IGFyZ3NbJ2NoYW5nZWQnXSAgIC8vIHRvcGljIHNlbGVjdFxuLy8gICAvLyBnZXQoICd0YWJsZScsICd0b3BpYycsICd0cmFuc3BvcnRhdGlvbicgKVxuLy8gICB2YXIgcGFpcnMgPSBEYXRhTWFuYWdlci5nZXQoeyBkYXRhOiBlbGVtZW50LmlkLCBmcm9tOiBjaGFuZ2VkLmlkLCB1c2luZzogdXNpbmcudmFsdWUgfSlcbi8vICAgdmFyIG9wdGlvbnMgPSBTZWxlY3RNYW5hZ2VyLmdlbmVyYXRlX29wdGlvbnMocGFpcnMsIHsgcGxhY2Vob2xkZXI6ICdTZWxlY3QnICsgZWxlbWVudC5pZCB9KVxuLy8gICBlbGVtZW50Lmh0bWwob3B0aW9ucykgfVxuXG5cbnZhciBnZW5lcmF0ZV9vcHRpb25zID0gZnVuY3Rpb24gKHBhaXJzLCBvcHRzKSB7XG4gIHZhciBvcHRzID0gb3B0cyB8fCB7fVxuICAgICwgcGxhY2Vob2xkZXIgPSBvcHRzWydwbGFjZWhvbGRlciddIHx8IFwiQ2hvb3NlIG9uZVwiXG4gICAgLCB0ZXh0ID0gb3B0c1sndGV4dCddXG4gICAgLCB2YWx1ZSA9IG9wdHNbJ3ZhbHVlJ11cbiAgICAsIG9wdGlvbnMgPSBbXVxuICBjb25zb2xlLmxvZyhcInBhaXJzXCIpXG4gIGNvbnNvbGUubG9nKHBhaXJzKVxuICBjb25zb2xlLmxvZygndGV4dDonKyB0ZXh0ICsnLCB2YWx1ZTonICsgdmFsdWUpXG4gIGlmIChfLmlzU3RyaW5nKHBhaXJzWzBdKSkge1xuICAgIHBhaXJzID0gcGFpcnNfZnJvbV9hcnJheShwYWlycykgfVxuICBlbHNlIGlmIChfLmlzT2JqZWN0KHBhaXJzWzBdKSkge1xuICAgIHBhaXJzID0gcGFpcnNfZnJvbV9vYmplY3RzKHsgb2JqZWN0czogcGFpcnMsIHRleHQ6IHRleHQsIHZhbHVlOiB2YWx1ZSB9KSBcbiAgICAvLyBjb25zb2xlLmxvZyhwYWlycykgXG4gIH1cblxuXG4gIG9wdGlvbnMucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIlwiPicgKyBwbGFjZWhvbGRlciArICc8L29wdGlvbj4nKVxuICBvcHRpb25zLnB1c2goIG9wdGlvbnNfZnJvbV9oYXNoKHBhaXJzLCBvcHRzKSApXG4gIHJldHVybiBvcHRpb25zLmpvaW4oXCJcXG5cIikgfVxuXG5cbnZhciBwYWlyc19mcm9tX2FycmF5ID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gIHZhciBwYWlycyA9IHt9XG4gIF8uZm9yRWFjaChhcnJheSwgZnVuY3Rpb24oZWxlbWVudCkgeyBwYWlyc1tlbGVtZW50XSA9IGVsZW1lbnQgfSlcbiAgcmV0dXJuIHBhaXJzIH1cblxuXG52YXIgcGFpcnNfZnJvbV9vYmplY3RzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgdmFyIG9iamVjdHMgPSBhcmdzWydvYmplY3RzJ11cbiAgICAsIHRleHQgICAgPSBhcmdzWyd0ZXh0J11cbiAgICAsIHZhbHVlICAgPSBhcmdzWyd2YWx1ZSddXG4gICAgLCBwYWlycyAgID0gW11cblxuICBfLmZvckVhY2gob2JqZWN0cywgZnVuY3Rpb24ob2JqZWN0KSB7IFxuICAgIHBhaXJzW29iamVjdFt0ZXh0XV0gPSBvYmplY3RbdmFsdWVdIH0pXG5cbiAgcmV0dXJuIHBhaXJzIH1cblxuXG52YXIgb3B0aW9uc19mcm9tX2hhc2ggPSBmdW5jdGlvbiAocGFpcnMsIG9wdHMpIHtcbiAgdmFyIG9wdGlvbnMgPSBbXVxuICAgICwgc2VsZWN0ZWQgPSAnJ1xuICBfLmZvckluKHBhaXJzLCBmdW5jdGlvbih2YWx1ZSwga2V5KXtcbiAgICBvcHRpb25zLnB1c2goJzxvcHRpb24gdmFsdWU9XCInKyB2YWx1ZSArJ1wiICcrIHNlbGVjdGVkICsnPicrIGtleSArJzwvb3B0aW9uPicpXG4gIH0pO1xuICByZXR1cm4gb3B0aW9uc1xufVxuXG52YXIgcG9wdWxhdGVfbmV4dCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHZhbHVlID0gb2JqLnZhbCgpXG4gICAgLCBuZXh0ICA9IG9iai5uZXh0KClcbiAgICAsIGlkICAgID0gb2JqLmF0dHIoJ2lkJylcbiAgICAsIG9wdHMgID0ge31cblxuICAvLyBjb25zb2xlLmxvZygncG9wdWxhdGVfbmV4dCB3aXRoICcpIDsgY29uc29sZS5sb2coIG9iaiApXG4gIC8vIGNvbnNvbGUubG9nKCd2YWx1ZSAnICsgdmFsdWUpICAgICAgOyBjb25zb2xlLmxvZygnaWQgJyArIGlkKVxuICAvLyBjb25zb2xlLmxvZygnbmV4dCAnKSAgICAgICAgICAgICAgIDsgY29uc29sZS5sb2cobmV4dClcblxuICBzd2l0Y2ggKGlkKSB7XG4gICAgY2FzZSAndG9waWMnOlxuICAgICAgb3B0cyA9IHt0ZXh0OiAndGl0bGUnLCB2YWx1ZTogJ25hbWUnfVxuICAgICAgRGF0YU1hbmFnZXIuZ2V0X3RhYmxlcyh2YWx1ZSwgZnVuY3Rpb24gKHBhaXJzKSB7XG4gICAgICAgIG5leHQuaHRtbCggZ2VuZXJhdGVfb3B0aW9ucyhwYWlycywgb3B0cykgKVxuICAgICAgfSlcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RhYmxlJzpcbiAgICAgIG9wdHMgPSB7dGV4dDogJ2FsaWFzJywgdmFsdWU6ICdmaWVsZF9uYW1lJ31cbiAgICAgIERhdGFNYW5hZ2VyLmdldF9maWVsZHMoeyB0YWJsZTogdmFsdWUsIGNhbGxiYWNrOiBmdW5jdGlvbiAocGFpcnMpIHtcbiAgICAgICAgbmV4dC5odG1sKCBnZW5lcmF0ZV9vcHRpb25zKHBhaXJzLCBvcHRzKSApXG4gICAgICB9fSlcbiAgICAgIG9wdHNfZ2VvID0ge3RleHQ6ICd0aXRsZScsIHZhbHVlOiAnbmFtZSd9XG4gICAgICBEYXRhTWFuYWdlci5nZXRfZ2VvZ3JhcGhpZXMoe3RhYmxlOiB2YWx1ZSwgY2FsbGJhY2s6IGZ1bmN0aW9uIChwYWlycykge1xuICAgICAgICBuZXh0Lm5leHQoKS5odG1sKCBnZW5lcmF0ZV9vcHRpb25zKHBhaXJzLCBvcHRzX2dlbykgKVxuICAgICAgfX0pXG4gICAgICBicmVhaztcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdlbmVyYXRlX29wdGlvbnM6ICBnZW5lcmF0ZV9vcHRpb25zXG4gICwgcG9wdWxhdGVfbmV4dDogcG9wdWxhdGVfbmV4dFxufSIsIlxudmFyIHpvb21fY29uZmlnID0ge1xuICAgICAgODogICdtdW5pY2lwYWxpdHknXG4gICAgLCAxMjogWydjZW5zdXNfdHJhY3QnLCAnc2Nob29sX2Rpc3RyaWN0J11cbiAgICAsIDE1OiAnY2Vuc3VzX2Jsb2NrZ3JvdXAnIH1cblxuXG52YXIgYXJyYXlpZnkgPSBmdW5jdGlvbiAoaGFzaCkge1xuICBjb25zb2xlLmxvZygnWm9vbU1hbmFnZXIjYXJyYXlpZnknKVxuICB2YXIgbWF4ICAgPSBfLm1heCggXy5tYXAoXy5rZXlzKGhhc2gpLCBmdW5jdGlvbiAoZSkgeyByZXR1cm4gXy5wYXJzZUludChlKSB9ICkpXG4gICAgLCBhcnJheSA9IEFycmF5KG1heCkgLy8gVE9ETzogb3IsIG1hcC5tYXhab29tKClcblxuICBfLmVhY2goaGFzaCwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIGFycmF5W2tleV0gPSB2YWx1ZSB9KVxuICBjb25zb2xlLmxvZyhhcnJheSlcbiAgcmV0dXJuIGFycmF5XG59XG5cbnZhciB6b29tX2FycmF5ID0gYXJyYXlpZnkoem9vbV9jb25maWcpIFxuXG52YXIgYXBwcm9wcmlhdGVfc3VtbGV2ID0gZnVuY3Rpb24gKG1hcCwgc3VtbGV2cykge1xuICB2YXIgcmV0dXJuX3ZhbHVlXG4gIGNvbnNvbGUubG9nKCdab29tTWFuYWdlciNhcHByb3ByaWF0ZV9zdW1sZXYnKVxuICAvLyByZXR1cm5zIGEgdmFsdWUgbGlrZSAnY2Vuc3VzX2Jsb2NrZ3JvdXAnXG4gIFxuICAvLyBzdGFydHMgYXQgY3VycmVudCB6b29tLCB1bmxlc3MgdGhhdCdzIHRvbyBoaWdoXG4gIHZhciBzdGFydF96b29tID0gbWFwLmdldFpvb20oKVxuICBpZiAoIHN0YXJ0X3pvb20gPiB6b29tX2FycmF5Lmxlbmd0aCApIHN0YXJ0X3pvb20gPSB6b29tX2FycmF5Lmxlbmd0aFxuXG4gIC8vIGNvbnNvbGUubG9nKCdzdGFydCB6b29tOiAnICsgc3RhcnRfem9vbSlcbiAgLy8gd29yayBiYWNrIGZyb20gY2xvc2VzdCB0byBmYXJ0aGVzdFxuICBmb3IgKHZhciB6b29tID0gc3RhcnRfem9vbTsgem9vbSA+IC0xOyB6b29tLS0pe1xuICAgIG9wdGlvbnMgPSB6b29tX2FycmF5W3pvb21dICAvLyByZXQ6ICdjZW5zdXNfYmxvY2tzJyBvciBbJ2N0JywgJ3NkJ11cbiAgICBpZiAoISBfLmlzQXJyYXkob3B0aW9ucykpIG9wdGlvbnMgPSBbb3B0aW9uc10gLy8gZm9yY2UgdG8gYmUgQXJyYXlcblxuICAgIF8uZWFjaChvcHRpb25zLCBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdvcHRpb246ICcgKyBvcHRpb24pXG4gICAgICBfLmZvckluKHN1bWxldnMsIGZ1bmN0aW9uIChzdW1sZXYsIGtleSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnc3VtbGV2OiAnICsgc3VtbGV2Lm5hbWUpXG4gICAgICAgIGlmIChzdW1sZXYubmFtZSA9PT0gb3B0aW9uKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1JFVFVSTklORyAnICsgc3VtbGV2Lm5hbWUpXG4gICAgICAgICAgcmV0dXJuX3ZhbHVlID0gc3VtbGV2Lm5hbWVcbiAgICAgICAgfVxuICAgICAgfSkgIFxuICAgIH0pXG4gIH1cbiAgY29uc29sZS5sb2coJ3JldHVybl92YWx1ZTogJyArIHJldHVybl92YWx1ZSlcbiAgcmV0dXJuIHJldHVybl92YWx1ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXBwcm9wcmlhdGVfc3VtbGV2OiBhcHByb3ByaWF0ZV9zdW1sZXZcbn0iXX0=
;