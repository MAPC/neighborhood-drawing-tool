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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL2RhdGFfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWFpbi5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWVkaWF0b3IuanMiLCIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL3F1ZXJ5X21hbmFnZXIuanMiLCIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL3NlbGVjdF9tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBRdWVyeU1hbmFnZXIgPSByZXF1aXJlKCcuL3F1ZXJ5X21hbmFnZXInKVxuXG52YXIgZ2V0X3RvcGljcyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0X3RvcGljcycpXG4gIHZhciBjYXRlZ29yaWVzID0gW11cblxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsICdsaXN0JywgJ3ZlcmJvc2UnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIC8vIGNvbnNvbGUubG9nKCAnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBkYXRhOiAnICsgZGF0YSApXG4gICAgXG4gICAgXy5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgY2F0ZWdvcmllcy5wdXNoKHRhYmxlWydjYXRlZ29yeSddKSB9KVxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggXy51bmlxdWUoY2F0ZWdvcmllcykgKSB9XG4gIH0pXG59XG5cblxudmFyIGdldF90YWJsZXMgPSBmdW5jdGlvbiAoY2F0ZWdvcnksIGNhbGxiYWNrKSB7XG4gIC8vIGNvbnNvbGUubG9nKCAnRGF0YU1hbmFnZXIjZ2V0X3RhYmxlcycgKVxuICB2YXIgdGFibGVzID0gW11cblxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsICdsaXN0JywgJ3ZlcmJvc2UnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIC8vIGNvbnNvbGUubG9nKCAnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBkYXRhOiAnICsgZGF0YSApXG4gICAgXy5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgaWYgKCB0YWJsZVsnY2F0ZWdvcnknXSA9PT0gY2F0ZWdvcnkgKXtcbiAgICAgICAgdGFibGVzLnB1c2goIHRhYmxlIClcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayh0YWJsZXMpIH1cbiAgfSlcbn1cblxuXG52YXIgZ2V0X2ZpZWxkcyA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdEYXRhTWFuYWdlciNnZXRfZmllbGRzJylcbiAgdmFyIHRhYmxlICAgID0gYXJnc1sndGFibGUnXSxcbiAgICAgIGNhbGxiYWNrID0gYXJnc1snY2FsbGJhY2snXVxuICBcbiAgUXVlcnlNYW5hZ2VyLm1ldGEoJ3RhYnVsYXInLCB0YWJsZSwgJ21ldGEnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggZGF0YS5hdHRyaWJ1dGVzICkgfVxuICB9KVxufVxuXG52YXIgZ2V0X2dlb2dyYXBoaWVzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgLy8gY29uc29sZS5sb2coJ0RhdGFNYW5hZ2VyI2dldF9maWVsZHMnKVxuICB2YXIgdGFibGUgICAgPSBhcmdzWyd0YWJsZSddLFxuICAgICAgY2FsbGJhY2sgPSBhcmdzWydjYWxsYmFjayddXG4gIFxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsIHRhYmxlLCAnbWV0YScsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKCBkYXRhLnN1bW1hcnlfbGV2ZWxzICkgfVxuICB9KVxufVxuXG5cbnZhciBnZXQgPSBmdW5jdGlvbiAoYXJncykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0JylcbiAgLy8gY29uc29sZS5sb2coJ0dFVCcrIGFyZ3NbJ2RhdGEnXSArJyB3aGVyZSAnKyBhcmdzWydmcm9tJ10gKycgPSAnKyBhcmdzWyd1c2luZyddICsnLicgKVxufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0X3RvcGljczogIGdldF90b3BpY3NcbiAgLCBnZXRfdGFibGVzOiAgZ2V0X3RhYmxlc1xuICAsIGdldF9maWVsZHM6ICBnZXRfZmllbGRzXG4gICwgZ2V0X2dlb2dyYXBoaWVzOiBnZXRfZ2VvZ3JhcGhpZXMgXG59IiwiLy8gVE9ETyBzZXQgdXAgalF1ZXJ5IGRvY3VtZW50IHJlYWR5XG4vLyBUT0RPIHNldCB1cCBtYXBcblxuY29uc29sZS5sb2coJ2FsbG8gYWxsbycpXG5cbnZhciBNZWRpYXRvciAgICAgID0gcmVxdWlyZSgnLi9tZWRpYXRvcicpLm1lZGlhdG9yXG5cbnZhciBRdWVyeU1hbmFnZXIgID0gcmVxdWlyZSgnLi9xdWVyeV9tYW5hZ2VyJylcbnZhciBEYXRhTWFuYWdlciAgID0gcmVxdWlyZSgnLi9kYXRhX21hbmFnZXInKVxudmFyIFNlbGVjdE1hbmFnZXIgPSByZXF1aXJlKCcuL3NlbGVjdF9tYW5hZ2VyJylcblxuXG5EYXRhTWFuYWdlci5nZXRfdG9waWNzKCBmdW5jdGlvbiAodG9waWNzKSB7XG4gICQoJ3NlbGVjdCN0b3BpYycpLmh0bWwoXG4gICAgU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHRvcGljcykgKVxufSlcblxuLy8gRGF0YU1hbmFnZXIuZ2V0X3RhYmxlcygnVHJhbnNwb3J0YXRpb24nLCBmdW5jdGlvbiAodGFibGVzKSB7XG4vLyAgICQoJ3NlbGVjdCN0YWJsZScpLmh0bWwoXG4vLyAgICAgU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHRhYmxlcywge3RleHQ6ICd0aXRsZScsIHZhbHVlOiAnbmFtZSd9KSApXG4vLyB9KVxuXG4vLyBEYXRhTWFuYWdlci5nZXRfZmllbGRzKHt0YWJsZTogJ21lYW5zX3RyYW5zcG9ydGF0aW9uX3RvX3dvcmtfYnlfcmVzaWRlbmNlJywgY2FsbGJhY2s6IGZ1bmN0aW9uIChmaWVsZHMpIHtcbi8vICAgJCgnc2VsZWN0I2ZpZWxkJykuaHRtbChcbi8vICAgICBTZWxlY3RNYW5hZ2VyLmdlbmVyYXRlX29wdGlvbnMoZmllbGRzLCB7dGV4dDogJ2FsaWFzJywgdmFsdWU6ICdmaWVsZF9uYW1lJ30pIClcbi8vIH19KVxuXG4vLyBEYXRhTWFuYWdlci5nZXRfZ2VvZ3JhcGhpZXMoe3RhYmxlOiAnbWVhbnNfdHJhbnNwb3J0YXRpb25fdG9fd29ya19ieV9yZXNpZGVuY2UnLCBjYWxsYmFjazogZnVuY3Rpb24gKHN1bWxldnMpIHtcbi8vICAgJCgnc2VsZWN0I2dlb2dyYXBoeScpLmh0bWwoXG4vLyAgICAgU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHN1bWxldnMsIHt0ZXh0OiAnbmFtZScsIHZhbHVlOiAna2V5J30pIClcbi8vIH19KVxuXG5cblxuXG5cbi8vIERhdGFNYW5hZ2VyLmdldF9maWVsZHMoe3RhYmxlOiB0YWJsZSwgY2FsbGJhY2s6IGZ1bmN0aW9uIChmaWVsZHMpIHtcbi8vICAgbmV4dC5odG1sKFxuLy8gICAgIFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhmaWVsZHMsXG4vLyAgICAgIHsgdGV4dDogJ2FsaWFzJ1xuLy8gICAgICAsIHZhbHVlOiAnZmllbGRfbmFtZScgfSkgKVxuLy8gICB9fSlcbi8vIH1cblxuJCgnc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICBTZWxlY3RNYW5hZ2VyLnBvcHVsYXRlX25leHQoICQodGhpcykgKSB9KVxuXG5cblxuLy8gbWFwLm9uKCAnbG9hZCcsIGZ1bmN0aW9uKCkgICAgIHsgTWVkaWF0b3IucHVibGlzaCggJ21hcF9sb2FkZWQgJykgfSApXG4vLyBtYXAub24oICdtb3ZlZW5kJywgZnVuY3Rpb24gKCkgeyBNZWRpYXRvci5wdWJsaXNoKCAnbWFwX21vdmVkJyApIH0gKVxuLy8gbWFwLm9uKCAnem9vbWVuZCcsIGZ1bmN0aW9uICgpIHsgTWVkaWF0b3IucHVibGlzaCggJ21hcF96b29tZWQnICkgfSApXG5cbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ21hcF9sb2FkZWQnLCBNYXBNYW5hZ2VyLmluaXQoKSApXG4vLyBNZWRpYXRvci5zdWJzY3JpYmUoICdtYXBfbW92ZWQnLCAgTWFwTWFuYWdlci5oYW5kbGVfbW92ZSgpIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ21hcF96b29tZWQnLCBNYXBNYW5hZ2VyLmhhbmRsZV96b29tKCkgKVxuXG5cbi8vIG1hcC5vbiggJ2RyYXc6Y3JlYXRlJywgIGZ1bmN0aW9uIChkcmF3aW5nKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdmaWd1cmVfZHJhd24nICkgfSApXG4vLyBtYXAub24oICdkcmF3OmVkaXRlZCcsICBmdW5jdGlvbiAoZHJhd2luZykgeyBNZWRpYXRvci5wdWJsaXNoKCAnZmlndXJlX2VkaXRlZCcgKSB9IClcbi8vIG1hcC5vbiggJ2RyYXc6ZGVsZXRlZCcsIGZ1bmN0aW9uICgpIHsgTWVkaWF0b3IucHVibGlzaCggJ2ZpZ3VyZV9kZWxldGVkJyApIH0gKVxuXG4vLyBNZWRpYXRvci5zdWJzY3JpYmUoICdmaWd1cmVfZHJhd24nLCAgIFN0dWR5QXJlYU1hbmFnZXIuaGFuZGxlX2RyYXcoIGRyYXdpbmcgKSApXG4vLyBNZWRpYXRvci5zdWJzY3JpYmUoICdmaWd1cmVfZWRpdGVkJywgIFN0dWR5QXJlYU1hbmFnZXIuaGFuZGxlX2VkaXQoIGRyYXdpbmcgKSApXG4vLyBNZWRpYXRvci5zdWJzY3JpYmUoICdmaWd1cmVfZGVsZXRlZCcsIFN0dWR5QXJlYU1hbmFnZXIuaGFuZGxlX2RlbGV0ZSgpIClcblxuXG4vLyAkKCdzZWxlY3QnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuLy8gICB2YXIgc2VsZiAgPSAkKHRoaXMpLFxuLy8gICAgICAgdmFsdWUgPSBzZWxmLnZhbCgpIC8vIFRPRE8gb3Igc29tZXRoaW5nIGxpa2UgdGhpc1xuLy8gICBpZiAoc2VsZi5pZCA9PT0gJ2ZpZWxkJykge1xuLy8gICAgIE1lZGlhdG9yLnB1Ymxpc2ggKCAnZmllbGRfY2hhbmdlZCcsIHZhbHVlIClcbi8vICAgfSBlbHNlIHtcbi8vICAgICBNZWRpYXRvci5wdWJsaXNoKCAnc2VsZWN0X2NoYW5nZWQnLCB7c2VsZjogc2VsZiwgbmV4dDogc2VsZi5uZXh0KCksIHZhbHVlOiB2YWx1ZX0gKSB9XG4vLyB9KVxuXG4vLyBNZWRpYXRvci5zdWJzY3JpYmUoICdzZWxlY3RfY2hhbmdlZCcsIFNlbGVjdE1hbmFnZXIucG9wdWxhdGVfbmV4dCggYXJncyApIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZWxkX2NoYW5nZWQnLCAgTWFwTWFuYWdlci5jaGFuZ2VfZmllbGQoIGZpZWxkICkgKVxuIiwiLypcbiAgXG4gIE1lZGlhdG9yIGltcGxlbWVudGF0aW9uXG4gIGJ5IEFkZHkgT3NtYW5pXG4gIGh0dHA6Ly9hZGR5b3NtYW5pLmNvbS9sYXJnZXNjYWxlamF2YXNjcmlwdC9cblxuKi9cblxudmFyIG1lZGlhdG9yID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBzdWJzY3JpYmUgPSBmdW5jdGlvbihjaGFubmVsLCBmbil7XG4gICAgaWYgKCFtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXSkgbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF0gPSBbXTtcbiAgICBtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXS5wdXNoKHsgY29udGV4dDogdGhpcywgY2FsbGJhY2s6IGZuIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuIFxuICBwdWJsaXNoID0gZnVuY3Rpb24oY2hhbm5lbCl7XG4gICAgaWYgKCFtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXSkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IG1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdW2ldO1xuICAgICAgc3Vic2NyaXB0aW9uLmNhbGxiYWNrLmFwcGx5KHN1YnNjcmlwdGlvbi5jb250ZXh0LCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gXG4gIHJldHVybiB7XG4gICAgY2hhbm5lbHM6IHt9LFxuICAgIHB1Ymxpc2g6IHB1Ymxpc2gsXG4gICAgc3Vic2NyaWJlOiBzdWJzY3JpYmUsXG4gICAgaW5zdGFsbFRvOiBmdW5jdGlvbihvYmope1xuICAgICAgb2JqLnN1YnNjcmliZSA9IHN1YnNjcmliZTtcbiAgICAgICBvYmoucHVibGlzaCA9IHB1Ymxpc2g7XG4gICAgfVxuICB9O1xuXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWVkaWF0b3I6IG1lZGlhdG9yIH0iLCJ2YXIgYXBpX2Jhc2UgPSAnaHR0cDovL2xvY2FsaG9zdDoyNDc0J1xuXG52YXIgbWV0YSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gY29uc29sZS5sb2coJ1F1ZXJ5TWFuYWdlciNtZXRhIHdpdGggYXJnczogJylcbiAgLy8gY29uc29sZS5sb2coYXJndW1lbnRzKVxuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKFthcmdzLmxlbmd0aC0xXSlcbiAgcXVlcnlfcGF0aCA9ICcvJyArIGFyZ3Muam9pbihcIi9cIilcbiAgcmVxdWVzdCh7IFxuICAgIHBhdGg6IHF1ZXJ5X3BhdGgsXG4gICAgY2FsbGJhY2s6IGNhbGxiYWNrIH0pXG59XG5cbnZhciByZXF1ZXN0ID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgY2FsbGJhY2sgPSBhcmdzWydjYWxsYmFjayddXG4gIC8vIGNvbnNvbGUubG9nKCdRdWVyeU1hbmFnZXIjcmVxdWVzdCB3aXRoIGFyZ3M6ICcpXG4gIC8vIGNvbnNvbGUubG9nKGFyZ3MpXG4gIHZhciBiYXNlID0gYXJnc1snYXBpX2Jhc2UnXSAgIHx8IGFwaV9iYXNlXG4gICAgLCBwYXRoID0gYXJnc1sncGF0aCddICAgICAgIHx8ICcvJ1xuICAgICwgb3B0cyA9IGFyZ3NbJ3F1ZXJ5X2FyZ3MnXSB8fCAnJ1xuICAgICwgdHlwZSA9IGFyZ3NbJ21ldGhvZCddICAgICB8fCAnR0VUJ1xuICAgICwgZGF0YSA9IGFyZ3NbJ2RhdGEnXSAgICAgICB8fCBudWxsXG5cbiAgdmFyIHVybCA9IGJhc2UgKyBwYXRoICsgb3B0c1xuICAvLyBjb25zb2xlLmxvZygndXJsOicgKyB1cmwpXG5cbiAgJC5hamF4KHtcbiAgICB1cmw6IHVybCxcbiAgICB0eXBlOiB0eXBlLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyggJ1NVQ0NFU1M6ICcgKVxuICAgICAgLy8gY29uc29sZS5sb2coIGRhdGEgKVxuICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhkYXRhKVxuICAgICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKCAnRVJST1I6ICcgKVxuICAgICAgY29uc29sZS5sb2coIGUgKSB9XG4gIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBtZXRhOiBtZXRhIH0iLCJ2YXIgRGF0YU1hbmFnZXIgPSByZXF1aXJlKCcuL2RhdGFfbWFuYWdlcicpXG5cbi8vIFNlbGVjdE1hbmFnZXIuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbi8vICAgdmFyIHRvcGljICAgICA9ICQoJ3NlbGVjdCN0b3BpYycpXG4vLyAgICAgLCB0YWJsZSAgICAgPSAkKCdzZWxlY3QjdGFibGUnKVxuLy8gICAgICwgZmllbGQgICAgID0gJCgnc2VsZWN0I2ZpZWxkJylcbi8vICAgICAsIGdlb2dyYXBoeSA9ICQoJ3NlbGVjdCNnZW9ncmFwaHknKVxuLy8gICAgICwgc2VsZWN0cyA9IFt0b3BpYywgdGFibGUsIGZpZWxkLCBnZW9ncmFwaHldXG5cbi8vICAgXy5mb3JFYWNoKHNlbGVjdHMsIGZ1bmN0aW9uIChzZWxlY3QpIHtcbi8vICAgICBTZWxlY3RNYW5hZ2VyLnBvcHVsYXRlKCBzZWxlY3QsICApXG4vLyAgIH0pXG4vLyB9XG5cbi8vIFNlbGVjdE1hbmFnZXIudXBkYXRlX2NvbnRyb2xzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbi8vICAgY29uc29sZS5sb2coJ1NlbGVjdE1hbmFnZXIjdXBkYXRlX2NvbnRyb2xzIHdpdGggYXJnczogJyArIGFyZ3MpXG4vLyAgIFNlbGVjdE1hbmFnZXIucG9wdWxhdGUoeyBlbGVtZW50OiBhcmdzWyd0b191cGRhdGUnXVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICwgdXNpbmc6ICAgYXJnc1snc2VsZWN0ZWQnXVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICwgZnJvbTogICAgYXJnc1snY2hhbmdlZCddIFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuXG4vLyB2YXIgcG9wdWxhdGVfbmV4dCA9IGZ1bmN0aW9uKClcblxuLy8gU2VsZWN0TWFuYWdlci5wb3B1bGF0ZSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4vLyAgIGNvbnNvbGUubG9nKCdTZWxlY3RNYW5hZ2VyI3BvcHVsYXRlIHdpdGggYXJnczogJyArIGFyZ3MpXG4vLyAgIHZhciBlbGVtZW50ID0gYXJnc1snZWxlbWVudCddICAgLy8gdGFibGUgc2VsZWN0XG4vLyAgICAgLCB1c2luZyAgID0gYXJnc1sndXNpbmcnXSAgICAgLy8gdG9waWMgb3B0aW9uXG4vLyAgICAgLCBjaGFuZ2VkID0gYXJnc1snY2hhbmdlZCddICAgLy8gdG9waWMgc2VsZWN0XG4vLyAgIC8vIGdldCggJ3RhYmxlJywgJ3RvcGljJywgJ3RyYW5zcG9ydGF0aW9uJyApXG4vLyAgIHZhciBwYWlycyA9IERhdGFNYW5hZ2VyLmdldCh7IGRhdGE6IGVsZW1lbnQuaWQsIGZyb206IGNoYW5nZWQuaWQsIHVzaW5nOiB1c2luZy52YWx1ZSB9KVxuLy8gICB2YXIgb3B0aW9ucyA9IFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhwYWlycywgeyBwbGFjZWhvbGRlcjogJ1NlbGVjdCcgKyBlbGVtZW50LmlkIH0pXG4vLyAgIGVsZW1lbnQuaHRtbChvcHRpb25zKSB9XG5cblxudmFyIGdlbmVyYXRlX29wdGlvbnMgPSBmdW5jdGlvbiAocGFpcnMsIG9wdHMpIHtcbiAgdmFyIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgLCBwbGFjZWhvbGRlciA9IG9wdHNbJ3BsYWNlaG9sZGVyJ10gfHwgXCJDaG9vc2Ugb25lXCJcbiAgICAsIHRleHQgPSBvcHRzWyd0ZXh0J11cbiAgICAsIHZhbHVlID0gb3B0c1sndmFsdWUnXVxuICAgICwgb3B0aW9ucyA9IFtdXG4gIGNvbnNvbGUubG9nKFwicGFpcnNcIilcbiAgY29uc29sZS5sb2cocGFpcnMpXG4gIGNvbnNvbGUubG9nKCd0ZXh0OicrIHRleHQgKycsIHZhbHVlOicgKyB2YWx1ZSlcbiAgaWYgKF8uaXNTdHJpbmcocGFpcnNbMF0pKSB7XG4gICAgcGFpcnMgPSBwYWlyc19mcm9tX2FycmF5KHBhaXJzKSB9XG4gIGVsc2UgaWYgKF8uaXNPYmplY3QocGFpcnNbMF0pKSB7XG4gICAgcGFpcnMgPSBwYWlyc19mcm9tX29iamVjdHMoeyBvYmplY3RzOiBwYWlycywgdGV4dDogdGV4dCwgdmFsdWU6IHZhbHVlIH0pIFxuICAgIC8vIGNvbnNvbGUubG9nKHBhaXJzKSBcbiAgfVxuXG5cbiAgb3B0aW9ucy5wdXNoKCc8b3B0aW9uIHZhbHVlPVwiXCI+JyArIHBsYWNlaG9sZGVyICsgJzwvb3B0aW9uPicpXG4gIG9wdGlvbnMucHVzaCggb3B0aW9uc19mcm9tX2hhc2gocGFpcnMsIG9wdHMpIClcbiAgcmV0dXJuIG9wdGlvbnMuam9pbihcIlxcblwiKSB9XG5cblxudmFyIHBhaXJzX2Zyb21fYXJyYXkgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgdmFyIHBhaXJzID0ge31cbiAgXy5mb3JFYWNoKGFycmF5LCBmdW5jdGlvbihlbGVtZW50KSB7IHBhaXJzW2VsZW1lbnRdID0gZWxlbWVudCB9KVxuICByZXR1cm4gcGFpcnMgfVxuXG5cbnZhciBwYWlyc19mcm9tX29iamVjdHMgPSBmdW5jdGlvbiAoYXJncykge1xuICB2YXIgb2JqZWN0cyA9IGFyZ3NbJ29iamVjdHMnXVxuICAgICwgdGV4dCAgICA9IGFyZ3NbJ3RleHQnXVxuICAgICwgdmFsdWUgICA9IGFyZ3NbJ3ZhbHVlJ11cbiAgICAsIHBhaXJzICAgPSBbXVxuXG4gIF8uZm9yRWFjaChvYmplY3RzLCBmdW5jdGlvbihvYmplY3QpIHsgXG4gICAgcGFpcnNbb2JqZWN0W3RleHRdXSA9IG9iamVjdFt2YWx1ZV0gfSlcblxuICByZXR1cm4gcGFpcnMgfVxuXG5cbnZhciBvcHRpb25zX2Zyb21faGFzaCA9IGZ1bmN0aW9uIChwYWlycywgb3B0cykge1xuICB2YXIgb3B0aW9ucyA9IFtdXG4gICAgLCBzZWxlY3RlZCA9ICcnXG4gIF8uZm9ySW4ocGFpcnMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgIG9wdGlvbnMucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicrIHZhbHVlICsnXCIgJysgc2VsZWN0ZWQgKyc+Jysga2V5ICsnPC9vcHRpb24+JylcbiAgfSk7XG4gIHJldHVybiBvcHRpb25zXG59XG5cbnZhciBwb3B1bGF0ZV9uZXh0ID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgdmFsdWUgPSBvYmoudmFsKClcbiAgICAsIG5leHQgID0gb2JqLm5leHQoKVxuICAgICwgaWQgICAgPSBvYmouYXR0cignaWQnKVxuICAgICwgb3B0cyAgPSB7fVxuXG4gIC8vIGNvbnNvbGUubG9nKCdwb3B1bGF0ZV9uZXh0IHdpdGggJykgOyBjb25zb2xlLmxvZyggb2JqIClcbiAgLy8gY29uc29sZS5sb2coJ3ZhbHVlICcgKyB2YWx1ZSkgICAgICA7IGNvbnNvbGUubG9nKCdpZCAnICsgaWQpXG4gIC8vIGNvbnNvbGUubG9nKCduZXh0ICcpICAgICAgICAgICAgICAgOyBjb25zb2xlLmxvZyhuZXh0KVxuXG4gIHN3aXRjaCAoaWQpIHtcbiAgICBjYXNlICd0b3BpYyc6XG4gICAgICBvcHRzID0ge3RleHQ6ICd0aXRsZScsIHZhbHVlOiAnbmFtZSd9XG4gICAgICBEYXRhTWFuYWdlci5nZXRfdGFibGVzKHZhbHVlLCBmdW5jdGlvbiAocGFpcnMpIHtcbiAgICAgICAgbmV4dC5odG1sKCBnZW5lcmF0ZV9vcHRpb25zKHBhaXJzLCBvcHRzKSApXG4gICAgICB9KVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFibGUnOlxuICAgICAgb3B0cyA9IHt0ZXh0OiAnYWxpYXMnLCB2YWx1ZTogJ2ZpZWxkX25hbWUnfVxuICAgICAgRGF0YU1hbmFnZXIuZ2V0X2ZpZWxkcyh7IHRhYmxlOiB2YWx1ZSwgY2FsbGJhY2s6IGZ1bmN0aW9uIChwYWlycykge1xuICAgICAgICBuZXh0Lmh0bWwoIGdlbmVyYXRlX29wdGlvbnMocGFpcnMsIG9wdHMpIClcbiAgICAgIH19KVxuICAgICAgb3B0c19nZW8gPSB7dGV4dDogJ25hbWUnLCB2YWx1ZTogJ2tleSd9XG4gICAgICBEYXRhTWFuYWdlci5nZXRfZ2VvZ3JhcGhpZXMoe3RhYmxlOiB2YWx1ZSwgY2FsbGJhY2s6IGZ1bmN0aW9uIChwYWlycykge1xuICAgICAgICBuZXh0Lm5leHQoKS5odG1sKCBnZW5lcmF0ZV9vcHRpb25zKHBhaXJzLCBvcHRzX2dlbykgKVxuICAgICAgfX0pXG4gICAgICBicmVhaztcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdlbmVyYXRlX29wdGlvbnM6ICBnZW5lcmF0ZV9vcHRpb25zXG4gICwgcG9wdWxhdGVfbmV4dDogcG9wdWxhdGVfbmV4dFxufSJdfQ==
;