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
},{"./query_manager":4}],2:[function(require,module,exports){
// TODO set up jQuery document ready
// TODO set up map

console.log('allo allo')

var Mediator      = require('./mediator').mediator

var QueryManager  = require('./query_manager')
var DataManager   = require('./data_manager')
var SelectManager = require('./select_manager')


DataManager.get_topics( function (topics) {
  $('select#topic').html(
    SelectManager.generate_options(topics) )
})

// DataManager.get_tables('Transportation', function (tables) {
//   $('select#table').html(
//     SelectManager.generate_options(tables, {text: 'title', value: 'name'}) )
// })

// DataManager.get_fields({table: 'means_transportation_to_work_by_residence', callback: function (fields) {
//   $('select#field').html(
//     SelectManager.generate_options(fields, {text: 'alias', value: 'field_name'}) )
// }})

// DataManager.get_geographies({table: 'means_transportation_to_work_by_residence', callback: function (sumlevs) {
//   $('select#geography').html(
//     SelectManager.generate_options(sumlevs, {text: 'name', value: 'key'}) )
// }})





// DataManager.get_fields({table: table, callback: function (fields) {
//   next.html(
//     SelectManager.generate_options(fields,
//      { text: 'alias'
//      , value: 'field_name' }) )
//   }})
// }

$('select').on('change', function() {
  SelectManager.populate_next( $(this) ) })


var mapc_url    = 'http://tiles.mapc.org/basemap/{z}/{x}/{y}.png'
  , mapc_attrib = 'Tiles by <a href="http://www.mapc.org/">MAPC</a>.'


// var hey = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
//     key: 'd4fc77ea4a63471cab2423e66626cbb6',
//     attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     styleId: 22677
//   });


var tiles  = L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
              attribution: 'Tiles by <a href="http://www.mapc.org/">Metropolitan Area Planning Council</a>.' })
  // , tiles2 = L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
  //             attribution: 'Tiles by <a href="http://www.mapc.org/">MAPC</a>.' })

var baseLayers = {
  "Metropolitan": tiles,
  // "MAPC": tiles2
}

var map = L.map('map', {
    center: new L.LatLng(42.4, -71.8)
  , zoom: 11
  , layers: tiles
})

var layer_control = L.control.layers(baseLayers).addTo(map)






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

},{"./data_manager":1,"./mediator":3,"./query_manager":4,"./select_manager":5}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
      opts_geo = {text: 'name', value: 'key'}
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
},{"./data_manager":1}]},{},[2])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL2RhdGFfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWFpbi5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWVkaWF0b3IuanMiLCIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL3F1ZXJ5X21hbmFnZXIuanMiLCIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL3NlbGVjdF9tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBRdWVyeU1hbmFnZXIgPSByZXF1aXJlKCcuL3F1ZXJ5X21hbmFnZXInKVxuXG52YXIgZ2V0X3RvcGljcyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0X3RvcGljcycpXG4gIHZhciBjYXRlZ29yaWVzID0gW11cblxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsICdsaXN0JywgJ3ZlcmJvc2UnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIC8vIGNvbnNvbGUubG9nKCAnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBkYXRhOiAnICsgZGF0YSApXG4gICAgXG4gICAgXy5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgY2F0ZWdvcmllcy5wdXNoKHRhYmxlWydjYXRlZ29yeSddKSB9KVxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggXy51bmlxdWUoY2F0ZWdvcmllcykgKSB9XG4gIH0pXG59XG5cblxudmFyIGdldF90YWJsZXMgPSBmdW5jdGlvbiAoY2F0ZWdvcnksIGNhbGxiYWNrKSB7XG4gIC8vIGNvbnNvbGUubG9nKCAnRGF0YU1hbmFnZXIjZ2V0X3RhYmxlcycgKVxuICB2YXIgdGFibGVzID0gW11cblxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsICdsaXN0JywgJ3ZlcmJvc2UnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIC8vIGNvbnNvbGUubG9nKCAnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBkYXRhOiAnICsgZGF0YSApXG4gICAgXy5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgaWYgKCB0YWJsZVsnY2F0ZWdvcnknXSA9PT0gY2F0ZWdvcnkgKXtcbiAgICAgICAgdGFibGVzLnB1c2goIHRhYmxlIClcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayh0YWJsZXMpIH1cbiAgfSlcbn1cblxuXG52YXIgZ2V0X2ZpZWxkcyA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdEYXRhTWFuYWdlciNnZXRfZmllbGRzJylcbiAgdmFyIHRhYmxlICAgID0gYXJnc1sndGFibGUnXSxcbiAgICAgIGNhbGxiYWNrID0gYXJnc1snY2FsbGJhY2snXVxuICBcbiAgUXVlcnlNYW5hZ2VyLm1ldGEoJ3RhYnVsYXInLCB0YWJsZSwgJ21ldGEnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggZGF0YS5hdHRyaWJ1dGVzICkgfVxuICB9KVxufVxuXG52YXIgZ2V0X2dlb2dyYXBoaWVzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgLy8gY29uc29sZS5sb2coJ0RhdGFNYW5hZ2VyI2dldF9maWVsZHMnKVxuICB2YXIgdGFibGUgICAgPSBhcmdzWyd0YWJsZSddLFxuICAgICAgY2FsbGJhY2sgPSBhcmdzWydjYWxsYmFjayddXG4gIFxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsIHRhYmxlLCAnbWV0YScsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKCBkYXRhLnN1bW1hcnlfbGV2ZWxzICkgfVxuICB9KVxufVxuXG5cbnZhciBnZXQgPSBmdW5jdGlvbiAoYXJncykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0JylcbiAgLy8gY29uc29sZS5sb2coJ0dFVCcrIGFyZ3NbJ2RhdGEnXSArJyB3aGVyZSAnKyBhcmdzWydmcm9tJ10gKycgPSAnKyBhcmdzWyd1c2luZyddICsnLicgKVxufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0X3RvcGljczogIGdldF90b3BpY3NcbiAgLCBnZXRfdGFibGVzOiAgZ2V0X3RhYmxlc1xuICAsIGdldF9maWVsZHM6ICBnZXRfZmllbGRzXG4gICwgZ2V0X2dlb2dyYXBoaWVzOiBnZXRfZ2VvZ3JhcGhpZXMgXG59IiwiLy8gVE9ETyBzZXQgdXAgalF1ZXJ5IGRvY3VtZW50IHJlYWR5XG4vLyBUT0RPIHNldCB1cCBtYXBcblxuY29uc29sZS5sb2coJ2FsbG8gYWxsbycpXG5cbnZhciBNZWRpYXRvciAgICAgID0gcmVxdWlyZSgnLi9tZWRpYXRvcicpLm1lZGlhdG9yXG5cbnZhciBRdWVyeU1hbmFnZXIgID0gcmVxdWlyZSgnLi9xdWVyeV9tYW5hZ2VyJylcbnZhciBEYXRhTWFuYWdlciAgID0gcmVxdWlyZSgnLi9kYXRhX21hbmFnZXInKVxudmFyIFNlbGVjdE1hbmFnZXIgPSByZXF1aXJlKCcuL3NlbGVjdF9tYW5hZ2VyJylcblxuXG5EYXRhTWFuYWdlci5nZXRfdG9waWNzKCBmdW5jdGlvbiAodG9waWNzKSB7XG4gICQoJ3NlbGVjdCN0b3BpYycpLmh0bWwoXG4gICAgU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHRvcGljcykgKVxufSlcblxuLy8gRGF0YU1hbmFnZXIuZ2V0X3RhYmxlcygnVHJhbnNwb3J0YXRpb24nLCBmdW5jdGlvbiAodGFibGVzKSB7XG4vLyAgICQoJ3NlbGVjdCN0YWJsZScpLmh0bWwoXG4vLyAgICAgU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHRhYmxlcywge3RleHQ6ICd0aXRsZScsIHZhbHVlOiAnbmFtZSd9KSApXG4vLyB9KVxuXG4vLyBEYXRhTWFuYWdlci5nZXRfZmllbGRzKHt0YWJsZTogJ21lYW5zX3RyYW5zcG9ydGF0aW9uX3RvX3dvcmtfYnlfcmVzaWRlbmNlJywgY2FsbGJhY2s6IGZ1bmN0aW9uIChmaWVsZHMpIHtcbi8vICAgJCgnc2VsZWN0I2ZpZWxkJykuaHRtbChcbi8vICAgICBTZWxlY3RNYW5hZ2VyLmdlbmVyYXRlX29wdGlvbnMoZmllbGRzLCB7dGV4dDogJ2FsaWFzJywgdmFsdWU6ICdmaWVsZF9uYW1lJ30pIClcbi8vIH19KVxuXG4vLyBEYXRhTWFuYWdlci5nZXRfZ2VvZ3JhcGhpZXMoe3RhYmxlOiAnbWVhbnNfdHJhbnNwb3J0YXRpb25fdG9fd29ya19ieV9yZXNpZGVuY2UnLCBjYWxsYmFjazogZnVuY3Rpb24gKHN1bWxldnMpIHtcbi8vICAgJCgnc2VsZWN0I2dlb2dyYXBoeScpLmh0bWwoXG4vLyAgICAgU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHN1bWxldnMsIHt0ZXh0OiAnbmFtZScsIHZhbHVlOiAna2V5J30pIClcbi8vIH19KVxuXG5cblxuXG5cbi8vIERhdGFNYW5hZ2VyLmdldF9maWVsZHMoe3RhYmxlOiB0YWJsZSwgY2FsbGJhY2s6IGZ1bmN0aW9uIChmaWVsZHMpIHtcbi8vICAgbmV4dC5odG1sKFxuLy8gICAgIFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhmaWVsZHMsXG4vLyAgICAgIHsgdGV4dDogJ2FsaWFzJ1xuLy8gICAgICAsIHZhbHVlOiAnZmllbGRfbmFtZScgfSkgKVxuLy8gICB9fSlcbi8vIH1cblxuJCgnc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICBTZWxlY3RNYW5hZ2VyLnBvcHVsYXRlX25leHQoICQodGhpcykgKSB9KVxuXG5cbnZhciBtYXBjX3VybCAgICA9ICdodHRwOi8vdGlsZXMubWFwYy5vcmcvYmFzZW1hcC97en0ve3h9L3t5fS5wbmcnXG4gICwgbWFwY19hdHRyaWIgPSAnVGlsZXMgYnkgPGEgaHJlZj1cImh0dHA6Ly93d3cubWFwYy5vcmcvXCI+TUFQQzwvYT4uJ1xuXG5cbi8vIHZhciBoZXkgPSBMLnRpbGVMYXllcignaHR0cDovL3tzfS50aWxlLmNsb3VkbWFkZS5jb20ve2tleX0ve3N0eWxlSWR9LzI1Ni97en0ve3h9L3t5fS5wbmcnLCB7XG4vLyAgICAga2V5OiAnZDRmYzc3ZWE0YTYzNDcxY2FiMjQyM2U2NjYyNmNiYjYnLFxuLy8gICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzJyxcbi8vICAgICBzdHlsZUlkOiAyMjY3N1xuLy8gICB9KTtcblxuXG52YXIgdGlsZXMgID0gTC50aWxlTGF5ZXIoJ2h0dHA6Ly90aWxlcy5tYXBjLm9yZy9iYXNlbWFwL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgICAgICAgYXR0cmlidXRpb246ICdUaWxlcyBieSA8YSBocmVmPVwiaHR0cDovL3d3dy5tYXBjLm9yZy9cIj5NZXRyb3BvbGl0YW4gQXJlYSBQbGFubmluZyBDb3VuY2lsPC9hPi4nIH0pXG4gIC8vICwgdGlsZXMyID0gTC50aWxlTGF5ZXIoJ2h0dHA6Ly90aWxlcy5tYXBjLm9yZy9iYXNlbWFwL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgLy8gICAgICAgICAgICAgYXR0cmlidXRpb246ICdUaWxlcyBieSA8YSBocmVmPVwiaHR0cDovL3d3dy5tYXBjLm9yZy9cIj5NQVBDPC9hPi4nIH0pXG5cbnZhciBiYXNlTGF5ZXJzID0ge1xuICBcIk1ldHJvcG9saXRhblwiOiB0aWxlcyxcbiAgLy8gXCJNQVBDXCI6IHRpbGVzMlxufVxuXG52YXIgbWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICBjZW50ZXI6IG5ldyBMLkxhdExuZyg0Mi40LCAtNzEuOClcbiAgLCB6b29tOiAxMVxuICAsIGxheWVyczogdGlsZXNcbn0pXG5cbnZhciBsYXllcl9jb250cm9sID0gTC5jb250cm9sLmxheWVycyhiYXNlTGF5ZXJzKS5hZGRUbyhtYXApXG5cblxuXG5cblxuXG4vLyBtYXAub24oICdsb2FkJywgZnVuY3Rpb24oKSAgICAgeyBNZWRpYXRvci5wdWJsaXNoKCAnbWFwX2xvYWRlZCAnKSB9IClcbi8vIG1hcC5vbiggJ21vdmVlbmQnLCBmdW5jdGlvbiAoKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdtYXBfbW92ZWQnICkgfSApXG4vLyBtYXAub24oICd6b29tZW5kJywgZnVuY3Rpb24gKCkgeyBNZWRpYXRvci5wdWJsaXNoKCAnbWFwX3pvb21lZCcgKSB9IClcblxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnbWFwX2xvYWRlZCcsIE1hcE1hbmFnZXIuaW5pdCgpIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ21hcF9tb3ZlZCcsICBNYXBNYW5hZ2VyLmhhbmRsZV9tb3ZlKCkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnbWFwX3pvb21lZCcsIE1hcE1hbmFnZXIuaGFuZGxlX3pvb20oKSApXG5cblxuLy8gbWFwLm9uKCAnZHJhdzpjcmVhdGUnLCAgZnVuY3Rpb24gKGRyYXdpbmcpIHsgTWVkaWF0b3IucHVibGlzaCggJ2ZpZ3VyZV9kcmF3bicgKSB9IClcbi8vIG1hcC5vbiggJ2RyYXc6ZWRpdGVkJywgIGZ1bmN0aW9uIChkcmF3aW5nKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdmaWd1cmVfZWRpdGVkJyApIH0gKVxuLy8gbWFwLm9uKCAnZHJhdzpkZWxldGVkJywgZnVuY3Rpb24gKCkgeyBNZWRpYXRvci5wdWJsaXNoKCAnZmlndXJlX2RlbGV0ZWQnICkgfSApXG5cbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9kcmF3bicsICAgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZHJhdyggZHJhd2luZyApIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9lZGl0ZWQnLCAgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZWRpdCggZHJhd2luZyApIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9kZWxldGVkJywgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZGVsZXRlKCkgKVxuXG5cbi8vICQoJ3NlbGVjdCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4vLyAgIHZhciBzZWxmICA9ICQodGhpcyksXG4vLyAgICAgICB2YWx1ZSA9IHNlbGYudmFsKCkgLy8gVE9ETyBvciBzb21ldGhpbmcgbGlrZSB0aGlzXG4vLyAgIGlmIChzZWxmLmlkID09PSAnZmllbGQnKSB7XG4vLyAgICAgTWVkaWF0b3IucHVibGlzaCAoICdmaWVsZF9jaGFuZ2VkJywgdmFsdWUgKVxuLy8gICB9IGVsc2Uge1xuLy8gICAgIE1lZGlhdG9yLnB1Ymxpc2goICdzZWxlY3RfY2hhbmdlZCcsIHtzZWxmOiBzZWxmLCBuZXh0OiBzZWxmLm5leHQoKSwgdmFsdWU6IHZhbHVlfSApIH1cbi8vIH0pXG5cbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ3NlbGVjdF9jaGFuZ2VkJywgU2VsZWN0TWFuYWdlci5wb3B1bGF0ZV9uZXh0KCBhcmdzICkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnZmllbGRfY2hhbmdlZCcsICBNYXBNYW5hZ2VyLmNoYW5nZV9maWVsZCggZmllbGQgKSApXG4iLCIvKlxuICBcbiAgTWVkaWF0b3IgaW1wbGVtZW50YXRpb25cbiAgYnkgQWRkeSBPc21hbmlcbiAgaHR0cDovL2FkZHlvc21hbmkuY29tL2xhcmdlc2NhbGVqYXZhc2NyaXB0L1xuXG4qL1xuXG52YXIgbWVkaWF0b3IgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIHN1YnNjcmliZSA9IGZ1bmN0aW9uKGNoYW5uZWwsIGZuKXtcbiAgICBpZiAoIW1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdKSBtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXSA9IFtdO1xuICAgIG1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdLnB1c2goeyBjb250ZXh0OiB0aGlzLCBjYWxsYmFjazogZm4gfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gXG4gIHB1Ymxpc2ggPSBmdW5jdGlvbihjaGFubmVsKXtcbiAgICBpZiAoIW1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF0ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgc3Vic2NyaXB0aW9uID0gbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF1baV07XG4gICAgICBzdWJzY3JpcHRpb24uY2FsbGJhY2suYXBwbHkoc3Vic2NyaXB0aW9uLmNvbnRleHQsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiBcbiAgcmV0dXJuIHtcbiAgICBjaGFubmVsczoge30sXG4gICAgcHVibGlzaDogcHVibGlzaCxcbiAgICBzdWJzY3JpYmU6IHN1YnNjcmliZSxcbiAgICBpbnN0YWxsVG86IGZ1bmN0aW9uKG9iail7XG4gICAgICBvYmouc3Vic2NyaWJlID0gc3Vic2NyaWJlO1xuICAgICAgIG9iai5wdWJsaXNoID0gcHVibGlzaDtcbiAgICB9XG4gIH07XG5cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0geyBtZWRpYXRvcjogbWVkaWF0b3IgfSIsInZhciBhcGlfYmFzZSA9ICdodHRwOi8vbG9jYWxob3N0OjI0NzQnXG5cbnZhciBtZXRhID0gZnVuY3Rpb24gKCkge1xuICAvLyBjb25zb2xlLmxvZygnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBhcmdzOiAnKVxuICAvLyBjb25zb2xlLmxvZyhhcmd1bWVudHMpXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoW2FyZ3MubGVuZ3RoLTFdKVxuICBxdWVyeV9wYXRoID0gJy8nICsgYXJncy5qb2luKFwiL1wiKVxuICByZXF1ZXN0KHsgXG4gICAgcGF0aDogcXVlcnlfcGF0aCxcbiAgICBjYWxsYmFjazogY2FsbGJhY2sgfSlcbn1cblxudmFyIHJlcXVlc3QgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBjYWxsYmFjayA9IGFyZ3NbJ2NhbGxiYWNrJ11cbiAgLy8gY29uc29sZS5sb2coJ1F1ZXJ5TWFuYWdlciNyZXF1ZXN0IHdpdGggYXJnczogJylcbiAgLy8gY29uc29sZS5sb2coYXJncylcbiAgdmFyIGJhc2UgPSBhcmdzWydhcGlfYmFzZSddICAgfHwgYXBpX2Jhc2VcbiAgICAsIHBhdGggPSBhcmdzWydwYXRoJ10gICAgICAgfHwgJy8nXG4gICAgLCBvcHRzID0gYXJnc1sncXVlcnlfYXJncyddIHx8ICcnXG4gICAgLCB0eXBlID0gYXJnc1snbWV0aG9kJ10gICAgIHx8ICdHRVQnXG4gICAgLCBkYXRhID0gYXJnc1snZGF0YSddICAgICAgIHx8IG51bGxcblxuICB2YXIgdXJsID0gYmFzZSArIHBhdGggKyBvcHRzXG4gIC8vIGNvbnNvbGUubG9nKCd1cmw6JyArIHVybClcblxuICAkLmFqYXgoe1xuICAgIHVybDogdXJsLFxuICAgIHR5cGU6IHR5cGUsXG4gICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCAnU1VDQ0VTUzogJyApXG4gICAgICAvLyBjb25zb2xlLmxvZyggZGF0YSApXG4gICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKGRhdGEpXG4gICAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbiAoZSkge1xuICAgICAgY29uc29sZS5sb2coICdFUlJPUjogJyApXG4gICAgICBjb25zb2xlLmxvZyggZSApIH1cbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IG1ldGE6IG1ldGEgfSIsInZhciBEYXRhTWFuYWdlciA9IHJlcXVpcmUoJy4vZGF0YV9tYW5hZ2VyJylcblxuLy8gU2VsZWN0TWFuYWdlci5pbml0ID0gZnVuY3Rpb24gKCkge1xuLy8gICB2YXIgdG9waWMgICAgID0gJCgnc2VsZWN0I3RvcGljJylcbi8vICAgICAsIHRhYmxlICAgICA9ICQoJ3NlbGVjdCN0YWJsZScpXG4vLyAgICAgLCBmaWVsZCAgICAgPSAkKCdzZWxlY3QjZmllbGQnKVxuLy8gICAgICwgZ2VvZ3JhcGh5ID0gJCgnc2VsZWN0I2dlb2dyYXBoeScpXG4vLyAgICAgLCBzZWxlY3RzID0gW3RvcGljLCB0YWJsZSwgZmllbGQsIGdlb2dyYXBoeV1cblxuLy8gICBfLmZvckVhY2goc2VsZWN0cywgZnVuY3Rpb24gKHNlbGVjdCkge1xuLy8gICAgIFNlbGVjdE1hbmFnZXIucG9wdWxhdGUoIHNlbGVjdCwgIClcbi8vICAgfSlcbi8vIH1cblxuLy8gU2VsZWN0TWFuYWdlci51cGRhdGVfY29udHJvbHMgPSBmdW5jdGlvbiAoYXJncykge1xuLy8gICBjb25zb2xlLmxvZygnU2VsZWN0TWFuYWdlciN1cGRhdGVfY29udHJvbHMgd2l0aCBhcmdzOiAnICsgYXJncylcbi8vICAgU2VsZWN0TWFuYWdlci5wb3B1bGF0ZSh7IGVsZW1lbnQ6IGFyZ3NbJ3RvX3VwZGF0ZSddXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgLCB1c2luZzogICBhcmdzWydzZWxlY3RlZCddXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgLCBmcm9tOiAgICBhcmdzWydjaGFuZ2VkJ10gXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB9KSB9XG5cbi8vIHZhciBwb3B1bGF0ZV9uZXh0ID0gZnVuY3Rpb24oKVxuXG4vLyBTZWxlY3RNYW5hZ2VyLnBvcHVsYXRlID0gZnVuY3Rpb24gKGFyZ3MpIHtcbi8vICAgY29uc29sZS5sb2coJ1NlbGVjdE1hbmFnZXIjcG9wdWxhdGUgd2l0aCBhcmdzOiAnICsgYXJncylcbi8vICAgdmFyIGVsZW1lbnQgPSBhcmdzWydlbGVtZW50J10gICAvLyB0YWJsZSBzZWxlY3Rcbi8vICAgICAsIHVzaW5nICAgPSBhcmdzWyd1c2luZyddICAgICAvLyB0b3BpYyBvcHRpb25cbi8vICAgICAsIGNoYW5nZWQgPSBhcmdzWydjaGFuZ2VkJ10gICAvLyB0b3BpYyBzZWxlY3Rcbi8vICAgLy8gZ2V0KCAndGFibGUnLCAndG9waWMnLCAndHJhbnNwb3J0YXRpb24nIClcbi8vICAgdmFyIHBhaXJzID0gRGF0YU1hbmFnZXIuZ2V0KHsgZGF0YTogZWxlbWVudC5pZCwgZnJvbTogY2hhbmdlZC5pZCwgdXNpbmc6IHVzaW5nLnZhbHVlIH0pXG4vLyAgIHZhciBvcHRpb25zID0gU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHBhaXJzLCB7IHBsYWNlaG9sZGVyOiAnU2VsZWN0JyArIGVsZW1lbnQuaWQgfSlcbi8vICAgZWxlbWVudC5odG1sKG9wdGlvbnMpIH1cblxuXG52YXIgZ2VuZXJhdGVfb3B0aW9ucyA9IGZ1bmN0aW9uIChwYWlycywgb3B0cykge1xuICB2YXIgb3B0cyA9IG9wdHMgfHwge31cbiAgICAsIHBsYWNlaG9sZGVyID0gb3B0c1sncGxhY2Vob2xkZXInXSB8fCBcIkNob29zZSBvbmVcIlxuICAgICwgdGV4dCA9IG9wdHNbJ3RleHQnXVxuICAgICwgdmFsdWUgPSBvcHRzWyd2YWx1ZSddXG4gICAgLCBvcHRpb25zID0gW11cbiAgY29uc29sZS5sb2coXCJwYWlyc1wiKVxuICBjb25zb2xlLmxvZyhwYWlycylcbiAgY29uc29sZS5sb2coJ3RleHQ6JysgdGV4dCArJywgdmFsdWU6JyArIHZhbHVlKVxuICBpZiAoXy5pc1N0cmluZyhwYWlyc1swXSkpIHtcbiAgICBwYWlycyA9IHBhaXJzX2Zyb21fYXJyYXkocGFpcnMpIH1cbiAgZWxzZSBpZiAoXy5pc09iamVjdChwYWlyc1swXSkpIHtcbiAgICBwYWlycyA9IHBhaXJzX2Zyb21fb2JqZWN0cyh7IG9iamVjdHM6IHBhaXJzLCB0ZXh0OiB0ZXh0LCB2YWx1ZTogdmFsdWUgfSkgXG4gICAgLy8gY29uc29sZS5sb2cocGFpcnMpIFxuICB9XG5cblxuICBvcHRpb25zLnB1c2goJzxvcHRpb24gdmFsdWU9XCJcIj4nICsgcGxhY2Vob2xkZXIgKyAnPC9vcHRpb24+JylcbiAgb3B0aW9ucy5wdXNoKCBvcHRpb25zX2Zyb21faGFzaChwYWlycywgb3B0cykgKVxuICByZXR1cm4gb3B0aW9ucy5qb2luKFwiXFxuXCIpIH1cblxuXG52YXIgcGFpcnNfZnJvbV9hcnJheSA9IGZ1bmN0aW9uIChhcnJheSkge1xuICB2YXIgcGFpcnMgPSB7fVxuICBfLmZvckVhY2goYXJyYXksIGZ1bmN0aW9uKGVsZW1lbnQpIHsgcGFpcnNbZWxlbWVudF0gPSBlbGVtZW50IH0pXG4gIHJldHVybiBwYWlycyB9XG5cblxudmFyIHBhaXJzX2Zyb21fb2JqZWN0cyA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gIHZhciBvYmplY3RzID0gYXJnc1snb2JqZWN0cyddXG4gICAgLCB0ZXh0ICAgID0gYXJnc1sndGV4dCddXG4gICAgLCB2YWx1ZSAgID0gYXJnc1sndmFsdWUnXVxuICAgICwgcGFpcnMgICA9IFtdXG5cbiAgXy5mb3JFYWNoKG9iamVjdHMsIGZ1bmN0aW9uKG9iamVjdCkgeyBcbiAgICBwYWlyc1tvYmplY3RbdGV4dF1dID0gb2JqZWN0W3ZhbHVlXSB9KVxuXG4gIHJldHVybiBwYWlycyB9XG5cblxudmFyIG9wdGlvbnNfZnJvbV9oYXNoID0gZnVuY3Rpb24gKHBhaXJzLCBvcHRzKSB7XG4gIHZhciBvcHRpb25zID0gW11cbiAgICAsIHNlbGVjdGVkID0gJydcbiAgXy5mb3JJbihwYWlycywgZnVuY3Rpb24odmFsdWUsIGtleSl7XG4gICAgb3B0aW9ucy5wdXNoKCc8b3B0aW9uIHZhbHVlPVwiJysgdmFsdWUgKydcIiAnKyBzZWxlY3RlZCArJz4nKyBrZXkgKyc8L29wdGlvbj4nKVxuICB9KTtcbiAgcmV0dXJuIG9wdGlvbnNcbn1cblxudmFyIHBvcHVsYXRlX25leHQgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciB2YWx1ZSA9IG9iai52YWwoKVxuICAgICwgbmV4dCAgPSBvYmoubmV4dCgpXG4gICAgLCBpZCAgICA9IG9iai5hdHRyKCdpZCcpXG4gICAgLCBvcHRzICA9IHt9XG5cbiAgLy8gY29uc29sZS5sb2coJ3BvcHVsYXRlX25leHQgd2l0aCAnKSA7IGNvbnNvbGUubG9nKCBvYmogKVxuICAvLyBjb25zb2xlLmxvZygndmFsdWUgJyArIHZhbHVlKSAgICAgIDsgY29uc29sZS5sb2coJ2lkICcgKyBpZClcbiAgLy8gY29uc29sZS5sb2coJ25leHQgJykgICAgICAgICAgICAgICA7IGNvbnNvbGUubG9nKG5leHQpXG5cbiAgc3dpdGNoIChpZCkge1xuICAgIGNhc2UgJ3RvcGljJzpcbiAgICAgIG9wdHMgPSB7dGV4dDogJ3RpdGxlJywgdmFsdWU6ICduYW1lJ31cbiAgICAgIERhdGFNYW5hZ2VyLmdldF90YWJsZXModmFsdWUsIGZ1bmN0aW9uIChwYWlycykge1xuICAgICAgICBuZXh0Lmh0bWwoIGdlbmVyYXRlX29wdGlvbnMocGFpcnMsIG9wdHMpIClcbiAgICAgIH0pXG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YWJsZSc6XG4gICAgICBvcHRzID0ge3RleHQ6ICdhbGlhcycsIHZhbHVlOiAnZmllbGRfbmFtZSd9XG4gICAgICBEYXRhTWFuYWdlci5nZXRfZmllbGRzKHsgdGFibGU6IHZhbHVlLCBjYWxsYmFjazogZnVuY3Rpb24gKHBhaXJzKSB7XG4gICAgICAgIG5leHQuaHRtbCggZ2VuZXJhdGVfb3B0aW9ucyhwYWlycywgb3B0cykgKVxuICAgICAgfX0pXG4gICAgICBvcHRzX2dlbyA9IHt0ZXh0OiAnbmFtZScsIHZhbHVlOiAna2V5J31cbiAgICAgIERhdGFNYW5hZ2VyLmdldF9nZW9ncmFwaGllcyh7dGFibGU6IHZhbHVlLCBjYWxsYmFjazogZnVuY3Rpb24gKHBhaXJzKSB7XG4gICAgICAgIG5leHQubmV4dCgpLmh0bWwoIGdlbmVyYXRlX29wdGlvbnMocGFpcnMsIG9wdHNfZ2VvKSApXG4gICAgICB9fSlcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2VuZXJhdGVfb3B0aW9uczogIGdlbmVyYXRlX29wdGlvbnNcbiAgLCBwb3B1bGF0ZV9uZXh0OiBwb3B1bGF0ZV9uZXh0XG59Il19
;