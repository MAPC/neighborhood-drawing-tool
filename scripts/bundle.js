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

DataManager.get_tables('Transportation', function (tables) {
  $('select#table').html(
    SelectManager.generate_options(tables, {text: 'title', value: 'name'}) )
})

DataManager.get_fields({table: 'means_transportation_to_work_by_residence', callback: function (fields) {
  $('select#field').html(
    SelectManager.generate_options(fields, {text: 'alias', value: 'field_name'}) )
}})

DataManager.get_geographies({table: 'means_transportation_to_work_by_residence', callback: function (sumlevs) {
  $('select#geography').html(
    SelectManager.generate_options(sumlevs, {text: 'name', value: 'key'}) )
}})


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
        next.html( SelectManager.generate_options(pairs, opts) )
      })
      break;
    case 'table':
      opts = {text: 'alias', value: 'field_name'}
      DataManager.get_fields({ table: value, callback: function (pairs) {
        next.html( SelectManager.generate_options(pairs, opts) )
      }})
      opts_geo = {text: 'name', value: 'key'}
      DataManager.get_geographies({table: value, callback: function (pairs) {
        next.next().html( SelectManager.generate_options(pairs, opts_geo) )
      }})
      break;
  }
}


// DataManager.get_fields({table: table, callback: function (fields) {
//   next.html(
//     SelectManager.generate_options(fields,
//      { text: 'alias'
//      , value: 'field_name' }) )
//   }})
// }

$('select').on('change', function() {
  populate_next( $(this) ) })



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


module.exports = {
    generate_options:  generate_options
}
},{}]},{},[2])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL2RhdGFfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWFpbi5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWVkaWF0b3IuanMiLCIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL3F1ZXJ5X21hbmFnZXIuanMiLCIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL3NlbGVjdF9tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBRdWVyeU1hbmFnZXIgPSByZXF1aXJlKCcuL3F1ZXJ5X21hbmFnZXInKVxuXG52YXIgZ2V0X3RvcGljcyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0X3RvcGljcycpXG4gIHZhciBjYXRlZ29yaWVzID0gW11cblxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsICdsaXN0JywgJ3ZlcmJvc2UnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIC8vIGNvbnNvbGUubG9nKCAnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBkYXRhOiAnICsgZGF0YSApXG4gICAgXG4gICAgXy5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgY2F0ZWdvcmllcy5wdXNoKHRhYmxlWydjYXRlZ29yeSddKSB9KVxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggXy51bmlxdWUoY2F0ZWdvcmllcykgKSB9XG4gIH0pXG59XG5cblxudmFyIGdldF90YWJsZXMgPSBmdW5jdGlvbiAoY2F0ZWdvcnksIGNhbGxiYWNrKSB7XG4gIC8vIGNvbnNvbGUubG9nKCAnRGF0YU1hbmFnZXIjZ2V0X3RhYmxlcycgKVxuICB2YXIgdGFibGVzID0gW11cblxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsICdsaXN0JywgJ3ZlcmJvc2UnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIC8vIGNvbnNvbGUubG9nKCAnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBkYXRhOiAnICsgZGF0YSApXG4gICAgXy5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgaWYgKCB0YWJsZVsnY2F0ZWdvcnknXSA9PT0gY2F0ZWdvcnkgKXtcbiAgICAgICAgdGFibGVzLnB1c2goIHRhYmxlIClcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayh0YWJsZXMpIH1cbiAgfSlcbn1cblxuXG52YXIgZ2V0X2ZpZWxkcyA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdEYXRhTWFuYWdlciNnZXRfZmllbGRzJylcbiAgdmFyIHRhYmxlICAgID0gYXJnc1sndGFibGUnXSxcbiAgICAgIGNhbGxiYWNrID0gYXJnc1snY2FsbGJhY2snXVxuICBcbiAgUXVlcnlNYW5hZ2VyLm1ldGEoJ3RhYnVsYXInLCB0YWJsZSwgJ21ldGEnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggZGF0YS5hdHRyaWJ1dGVzICkgfVxuICB9KVxufVxuXG52YXIgZ2V0X2dlb2dyYXBoaWVzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgLy8gY29uc29sZS5sb2coJ0RhdGFNYW5hZ2VyI2dldF9maWVsZHMnKVxuICB2YXIgdGFibGUgICAgPSBhcmdzWyd0YWJsZSddLFxuICAgICAgY2FsbGJhY2sgPSBhcmdzWydjYWxsYmFjayddXG4gIFxuICBRdWVyeU1hbmFnZXIubWV0YSgndGFidWxhcicsIHRhYmxlLCAnbWV0YScsIGZ1bmN0aW9uKGRhdGEpIHsgXG4gICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKCBkYXRhLnN1bW1hcnlfbGV2ZWxzICkgfVxuICB9KVxufVxuXG5cbnZhciBnZXQgPSBmdW5jdGlvbiAoYXJncykge1xuICAvLyBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0JylcbiAgLy8gY29uc29sZS5sb2coJ0dFVCcrIGFyZ3NbJ2RhdGEnXSArJyB3aGVyZSAnKyBhcmdzWydmcm9tJ10gKycgPSAnKyBhcmdzWyd1c2luZyddICsnLicgKVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldF90b3BpY3M6ICBnZXRfdG9waWNzXG4gICwgZ2V0X3RhYmxlczogIGdldF90YWJsZXNcbiAgLCBnZXRfZmllbGRzOiAgZ2V0X2ZpZWxkc1xuICAsIGdldF9nZW9ncmFwaGllczogZ2V0X2dlb2dyYXBoaWVzIFxufSIsIi8vIFRPRE8gc2V0IHVwIGpRdWVyeSBkb2N1bWVudCByZWFkeVxuLy8gVE9ETyBzZXQgdXAgbWFwXG5cbmNvbnNvbGUubG9nKCdhbGxvIGFsbG8nKVxuXG52YXIgTWVkaWF0b3IgICAgICA9IHJlcXVpcmUoJy4vbWVkaWF0b3InKS5tZWRpYXRvclxuXG52YXIgUXVlcnlNYW5hZ2VyICA9IHJlcXVpcmUoJy4vcXVlcnlfbWFuYWdlcicpXG52YXIgRGF0YU1hbmFnZXIgICA9IHJlcXVpcmUoJy4vZGF0YV9tYW5hZ2VyJylcbnZhciBTZWxlY3RNYW5hZ2VyID0gcmVxdWlyZSgnLi9zZWxlY3RfbWFuYWdlcicpXG5cblxuRGF0YU1hbmFnZXIuZ2V0X3RvcGljcyggZnVuY3Rpb24gKHRvcGljcykge1xuICAkKCdzZWxlY3QjdG9waWMnKS5odG1sKFxuICAgIFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyh0b3BpY3MpIClcbn0pXG5cbkRhdGFNYW5hZ2VyLmdldF90YWJsZXMoJ1RyYW5zcG9ydGF0aW9uJywgZnVuY3Rpb24gKHRhYmxlcykge1xuICAkKCdzZWxlY3QjdGFibGUnKS5odG1sKFxuICAgIFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyh0YWJsZXMsIHt0ZXh0OiAndGl0bGUnLCB2YWx1ZTogJ25hbWUnfSkgKVxufSlcblxuRGF0YU1hbmFnZXIuZ2V0X2ZpZWxkcyh7dGFibGU6ICdtZWFuc190cmFuc3BvcnRhdGlvbl90b193b3JrX2J5X3Jlc2lkZW5jZScsIGNhbGxiYWNrOiBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICQoJ3NlbGVjdCNmaWVsZCcpLmh0bWwoXG4gICAgU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKGZpZWxkcywge3RleHQ6ICdhbGlhcycsIHZhbHVlOiAnZmllbGRfbmFtZSd9KSApXG59fSlcblxuRGF0YU1hbmFnZXIuZ2V0X2dlb2dyYXBoaWVzKHt0YWJsZTogJ21lYW5zX3RyYW5zcG9ydGF0aW9uX3RvX3dvcmtfYnlfcmVzaWRlbmNlJywgY2FsbGJhY2s6IGZ1bmN0aW9uIChzdW1sZXZzKSB7XG4gICQoJ3NlbGVjdCNnZW9ncmFwaHknKS5odG1sKFxuICAgIFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhzdW1sZXZzLCB7dGV4dDogJ25hbWUnLCB2YWx1ZTogJ2tleSd9KSApXG59fSlcblxuXG52YXIgcG9wdWxhdGVfbmV4dCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHZhbHVlID0gb2JqLnZhbCgpXG4gICAgLCBuZXh0ICA9IG9iai5uZXh0KClcbiAgICAsIGlkICAgID0gb2JqLmF0dHIoJ2lkJylcbiAgICAsIG9wdHMgID0ge31cblxuICAvLyBjb25zb2xlLmxvZygncG9wdWxhdGVfbmV4dCB3aXRoICcpIDsgY29uc29sZS5sb2coIG9iaiApXG4gIC8vIGNvbnNvbGUubG9nKCd2YWx1ZSAnICsgdmFsdWUpICAgICAgOyBjb25zb2xlLmxvZygnaWQgJyArIGlkKVxuICAvLyBjb25zb2xlLmxvZygnbmV4dCAnKSAgICAgICAgICAgICAgIDsgY29uc29sZS5sb2cobmV4dClcblxuICBzd2l0Y2ggKGlkKSB7XG4gICAgY2FzZSAndG9waWMnOlxuICAgICAgb3B0cyA9IHt0ZXh0OiAndGl0bGUnLCB2YWx1ZTogJ25hbWUnfVxuICAgICAgRGF0YU1hbmFnZXIuZ2V0X3RhYmxlcyh2YWx1ZSwgZnVuY3Rpb24gKHBhaXJzKSB7XG4gICAgICAgIG5leHQuaHRtbCggU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHBhaXJzLCBvcHRzKSApXG4gICAgICB9KVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFibGUnOlxuICAgICAgb3B0cyA9IHt0ZXh0OiAnYWxpYXMnLCB2YWx1ZTogJ2ZpZWxkX25hbWUnfVxuICAgICAgRGF0YU1hbmFnZXIuZ2V0X2ZpZWxkcyh7IHRhYmxlOiB2YWx1ZSwgY2FsbGJhY2s6IGZ1bmN0aW9uIChwYWlycykge1xuICAgICAgICBuZXh0Lmh0bWwoIFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhwYWlycywgb3B0cykgKVxuICAgICAgfX0pXG4gICAgICBvcHRzX2dlbyA9IHt0ZXh0OiAnbmFtZScsIHZhbHVlOiAna2V5J31cbiAgICAgIERhdGFNYW5hZ2VyLmdldF9nZW9ncmFwaGllcyh7dGFibGU6IHZhbHVlLCBjYWxsYmFjazogZnVuY3Rpb24gKHBhaXJzKSB7XG4gICAgICAgIG5leHQubmV4dCgpLmh0bWwoIFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhwYWlycywgb3B0c19nZW8pIClcbiAgICAgIH19KVxuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuXG4vLyBEYXRhTWFuYWdlci5nZXRfZmllbGRzKHt0YWJsZTogdGFibGUsIGNhbGxiYWNrOiBmdW5jdGlvbiAoZmllbGRzKSB7XG4vLyAgIG5leHQuaHRtbChcbi8vICAgICBTZWxlY3RNYW5hZ2VyLmdlbmVyYXRlX29wdGlvbnMoZmllbGRzLFxuLy8gICAgICB7IHRleHQ6ICdhbGlhcydcbi8vICAgICAgLCB2YWx1ZTogJ2ZpZWxkX25hbWUnIH0pIClcbi8vICAgfX0pXG4vLyB9XG5cbiQoJ3NlbGVjdCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgcG9wdWxhdGVfbmV4dCggJCh0aGlzKSApIH0pXG5cblxuXG4vLyBtYXAub24oICdsb2FkJywgZnVuY3Rpb24oKSAgICAgeyBNZWRpYXRvci5wdWJsaXNoKCAnbWFwX2xvYWRlZCAnKSB9IClcbi8vIG1hcC5vbiggJ21vdmVlbmQnLCBmdW5jdGlvbiAoKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdtYXBfbW92ZWQnICkgfSApXG4vLyBtYXAub24oICd6b29tZW5kJywgZnVuY3Rpb24gKCkgeyBNZWRpYXRvci5wdWJsaXNoKCAnbWFwX3pvb21lZCcgKSB9IClcblxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnbWFwX2xvYWRlZCcsIE1hcE1hbmFnZXIuaW5pdCgpIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ21hcF9tb3ZlZCcsICBNYXBNYW5hZ2VyLmhhbmRsZV9tb3ZlKCkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnbWFwX3pvb21lZCcsIE1hcE1hbmFnZXIuaGFuZGxlX3pvb20oKSApXG5cblxuLy8gbWFwLm9uKCAnZHJhdzpjcmVhdGUnLCAgZnVuY3Rpb24gKGRyYXdpbmcpIHsgTWVkaWF0b3IucHVibGlzaCggJ2ZpZ3VyZV9kcmF3bicgKSB9IClcbi8vIG1hcC5vbiggJ2RyYXc6ZWRpdGVkJywgIGZ1bmN0aW9uIChkcmF3aW5nKSB7IE1lZGlhdG9yLnB1Ymxpc2goICdmaWd1cmVfZWRpdGVkJyApIH0gKVxuLy8gbWFwLm9uKCAnZHJhdzpkZWxldGVkJywgZnVuY3Rpb24gKCkgeyBNZWRpYXRvci5wdWJsaXNoKCAnZmlndXJlX2RlbGV0ZWQnICkgfSApXG5cbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9kcmF3bicsICAgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZHJhdyggZHJhd2luZyApIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9lZGl0ZWQnLCAgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZWRpdCggZHJhd2luZyApIClcbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ2ZpZ3VyZV9kZWxldGVkJywgU3R1ZHlBcmVhTWFuYWdlci5oYW5kbGVfZGVsZXRlKCkgKVxuXG5cbi8vICQoJ3NlbGVjdCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4vLyAgIHZhciBzZWxmICA9ICQodGhpcyksXG4vLyAgICAgICB2YWx1ZSA9IHNlbGYudmFsKCkgLy8gVE9ETyBvciBzb21ldGhpbmcgbGlrZSB0aGlzXG4vLyAgIGlmIChzZWxmLmlkID09PSAnZmllbGQnKSB7XG4vLyAgICAgTWVkaWF0b3IucHVibGlzaCAoICdmaWVsZF9jaGFuZ2VkJywgdmFsdWUgKVxuLy8gICB9IGVsc2Uge1xuLy8gICAgIE1lZGlhdG9yLnB1Ymxpc2goICdzZWxlY3RfY2hhbmdlZCcsIHtzZWxmOiBzZWxmLCBuZXh0OiBzZWxmLm5leHQoKSwgdmFsdWU6IHZhbHVlfSApIH1cbi8vIH0pXG5cbi8vIE1lZGlhdG9yLnN1YnNjcmliZSggJ3NlbGVjdF9jaGFuZ2VkJywgU2VsZWN0TWFuYWdlci5wb3B1bGF0ZV9uZXh0KCBhcmdzICkgKVxuLy8gTWVkaWF0b3Iuc3Vic2NyaWJlKCAnZmllbGRfY2hhbmdlZCcsICBNYXBNYW5hZ2VyLmNoYW5nZV9maWVsZCggZmllbGQgKSApXG4iLCIvKlxuICBcbiAgTWVkaWF0b3IgaW1wbGVtZW50YXRpb25cbiAgYnkgQWRkeSBPc21hbmlcbiAgaHR0cDovL2FkZHlvc21hbmkuY29tL2xhcmdlc2NhbGVqYXZhc2NyaXB0L1xuXG4qL1xuXG52YXIgbWVkaWF0b3IgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIHN1YnNjcmliZSA9IGZ1bmN0aW9uKGNoYW5uZWwsIGZuKXtcbiAgICBpZiAoIW1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdKSBtZWRpYXRvci5jaGFubmVsc1tjaGFubmVsXSA9IFtdO1xuICAgIG1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdLnB1c2goeyBjb250ZXh0OiB0aGlzLCBjYWxsYmFjazogZm4gfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gXG4gIHB1Ymxpc2ggPSBmdW5jdGlvbihjaGFubmVsKXtcbiAgICBpZiAoIW1lZGlhdG9yLmNoYW5uZWxzW2NoYW5uZWxdKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF0ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgc3Vic2NyaXB0aW9uID0gbWVkaWF0b3IuY2hhbm5lbHNbY2hhbm5lbF1baV07XG4gICAgICBzdWJzY3JpcHRpb24uY2FsbGJhY2suYXBwbHkoc3Vic2NyaXB0aW9uLmNvbnRleHQsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiBcbiAgcmV0dXJuIHtcbiAgICBjaGFubmVsczoge30sXG4gICAgcHVibGlzaDogcHVibGlzaCxcbiAgICBzdWJzY3JpYmU6IHN1YnNjcmliZSxcbiAgICBpbnN0YWxsVG86IGZ1bmN0aW9uKG9iail7XG4gICAgICBvYmouc3Vic2NyaWJlID0gc3Vic2NyaWJlO1xuICAgICAgIG9iai5wdWJsaXNoID0gcHVibGlzaDtcbiAgICB9XG4gIH07XG5cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0geyBtZWRpYXRvcjogbWVkaWF0b3IgfSIsInZhciBhcGlfYmFzZSA9ICdodHRwOi8vbG9jYWxob3N0OjI0NzQnXG5cbnZhciBtZXRhID0gZnVuY3Rpb24gKCkge1xuICAvLyBjb25zb2xlLmxvZygnUXVlcnlNYW5hZ2VyI21ldGEgd2l0aCBhcmdzOiAnKVxuICAvLyBjb25zb2xlLmxvZyhhcmd1bWVudHMpXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoW2FyZ3MubGVuZ3RoLTFdKVxuICBxdWVyeV9wYXRoID0gJy8nICsgYXJncy5qb2luKFwiL1wiKVxuICByZXF1ZXN0KHsgXG4gICAgcGF0aDogcXVlcnlfcGF0aCxcbiAgICBjYWxsYmFjazogY2FsbGJhY2sgfSlcbn1cblxudmFyIHJlcXVlc3QgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBjYWxsYmFjayA9IGFyZ3NbJ2NhbGxiYWNrJ11cbiAgLy8gY29uc29sZS5sb2coJ1F1ZXJ5TWFuYWdlciNyZXF1ZXN0IHdpdGggYXJnczogJylcbiAgLy8gY29uc29sZS5sb2coYXJncylcbiAgdmFyIGJhc2UgPSBhcmdzWydhcGlfYmFzZSddICAgfHwgYXBpX2Jhc2VcbiAgICAsIHBhdGggPSBhcmdzWydwYXRoJ10gICAgICAgfHwgJy8nXG4gICAgLCBvcHRzID0gYXJnc1sncXVlcnlfYXJncyddIHx8ICcnXG4gICAgLCB0eXBlID0gYXJnc1snbWV0aG9kJ10gICAgIHx8ICdHRVQnXG4gICAgLCBkYXRhID0gYXJnc1snZGF0YSddICAgICAgIHx8IG51bGxcblxuICB2YXIgdXJsID0gYmFzZSArIHBhdGggKyBvcHRzXG4gIC8vIGNvbnNvbGUubG9nKCd1cmw6JyArIHVybClcblxuICAkLmFqYXgoe1xuICAgIHVybDogdXJsLFxuICAgIHR5cGU6IHR5cGUsXG4gICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCAnU1VDQ0VTUzogJyApXG4gICAgICAvLyBjb25zb2xlLmxvZyggZGF0YSApXG4gICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKGRhdGEpXG4gICAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbiAoZSkge1xuICAgICAgY29uc29sZS5sb2coICdFUlJPUjogJyApXG4gICAgICBjb25zb2xlLmxvZyggZSApIH1cbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IG1ldGE6IG1ldGEgfSIsIi8vIFNlbGVjdE1hbmFnZXIuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbi8vICAgdmFyIHRvcGljICAgICA9ICQoJ3NlbGVjdCN0b3BpYycpXG4vLyAgICAgLCB0YWJsZSAgICAgPSAkKCdzZWxlY3QjdGFibGUnKVxuLy8gICAgICwgZmllbGQgICAgID0gJCgnc2VsZWN0I2ZpZWxkJylcbi8vICAgICAsIGdlb2dyYXBoeSA9ICQoJ3NlbGVjdCNnZW9ncmFwaHknKVxuLy8gICAgICwgc2VsZWN0cyA9IFt0b3BpYywgdGFibGUsIGZpZWxkLCBnZW9ncmFwaHldXG5cbi8vICAgXy5mb3JFYWNoKHNlbGVjdHMsIGZ1bmN0aW9uIChzZWxlY3QpIHtcbi8vICAgICBTZWxlY3RNYW5hZ2VyLnBvcHVsYXRlKCBzZWxlY3QsICApXG4vLyAgIH0pXG4vLyB9XG5cbi8vIFNlbGVjdE1hbmFnZXIudXBkYXRlX2NvbnRyb2xzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbi8vICAgY29uc29sZS5sb2coJ1NlbGVjdE1hbmFnZXIjdXBkYXRlX2NvbnRyb2xzIHdpdGggYXJnczogJyArIGFyZ3MpXG4vLyAgIFNlbGVjdE1hbmFnZXIucG9wdWxhdGUoeyBlbGVtZW50OiBhcmdzWyd0b191cGRhdGUnXVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICwgdXNpbmc6ICAgYXJnc1snc2VsZWN0ZWQnXVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICwgZnJvbTogICAgYXJnc1snY2hhbmdlZCddIFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuXG4vLyB2YXIgcG9wdWxhdGVfbmV4dCA9IGZ1bmN0aW9uKClcblxuLy8gU2VsZWN0TWFuYWdlci5wb3B1bGF0ZSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4vLyAgIGNvbnNvbGUubG9nKCdTZWxlY3RNYW5hZ2VyI3BvcHVsYXRlIHdpdGggYXJnczogJyArIGFyZ3MpXG4vLyAgIHZhciBlbGVtZW50ID0gYXJnc1snZWxlbWVudCddICAgLy8gdGFibGUgc2VsZWN0XG4vLyAgICAgLCB1c2luZyAgID0gYXJnc1sndXNpbmcnXSAgICAgLy8gdG9waWMgb3B0aW9uXG4vLyAgICAgLCBjaGFuZ2VkID0gYXJnc1snY2hhbmdlZCddICAgLy8gdG9waWMgc2VsZWN0XG4vLyAgIC8vIGdldCggJ3RhYmxlJywgJ3RvcGljJywgJ3RyYW5zcG9ydGF0aW9uJyApXG4vLyAgIHZhciBwYWlycyA9IERhdGFNYW5hZ2VyLmdldCh7IGRhdGE6IGVsZW1lbnQuaWQsIGZyb206IGNoYW5nZWQuaWQsIHVzaW5nOiB1c2luZy52YWx1ZSB9KVxuLy8gICB2YXIgb3B0aW9ucyA9IFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhwYWlycywgeyBwbGFjZWhvbGRlcjogJ1NlbGVjdCcgKyBlbGVtZW50LmlkIH0pXG4vLyAgIGVsZW1lbnQuaHRtbChvcHRpb25zKSB9XG5cblxudmFyIGdlbmVyYXRlX29wdGlvbnMgPSBmdW5jdGlvbiAocGFpcnMsIG9wdHMpIHtcbiAgdmFyIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgLCBwbGFjZWhvbGRlciA9IG9wdHNbJ3BsYWNlaG9sZGVyJ10gfHwgXCJDaG9vc2Ugb25lXCJcbiAgICAsIHRleHQgPSBvcHRzWyd0ZXh0J11cbiAgICAsIHZhbHVlID0gb3B0c1sndmFsdWUnXVxuICAgICwgb3B0aW9ucyA9IFtdXG4gIGNvbnNvbGUubG9nKFwicGFpcnNcIilcbiAgY29uc29sZS5sb2cocGFpcnMpXG4gIGNvbnNvbGUubG9nKCd0ZXh0OicrIHRleHQgKycsIHZhbHVlOicgKyB2YWx1ZSlcbiAgaWYgKF8uaXNTdHJpbmcocGFpcnNbMF0pKSB7XG4gICAgcGFpcnMgPSBwYWlyc19mcm9tX2FycmF5KHBhaXJzKSB9XG4gIGVsc2UgaWYgKF8uaXNPYmplY3QocGFpcnNbMF0pKSB7XG4gICAgcGFpcnMgPSBwYWlyc19mcm9tX29iamVjdHMoeyBvYmplY3RzOiBwYWlycywgdGV4dDogdGV4dCwgdmFsdWU6IHZhbHVlIH0pIFxuICAgIC8vIGNvbnNvbGUubG9nKHBhaXJzKSBcbiAgfVxuXG5cbiAgb3B0aW9ucy5wdXNoKCc8b3B0aW9uIHZhbHVlPVwiXCI+JyArIHBsYWNlaG9sZGVyICsgJzwvb3B0aW9uPicpXG4gIG9wdGlvbnMucHVzaCggb3B0aW9uc19mcm9tX2hhc2gocGFpcnMsIG9wdHMpIClcbiAgcmV0dXJuIG9wdGlvbnMuam9pbihcIlxcblwiKSB9XG5cblxudmFyIHBhaXJzX2Zyb21fYXJyYXkgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgdmFyIHBhaXJzID0ge31cbiAgXy5mb3JFYWNoKGFycmF5LCBmdW5jdGlvbihlbGVtZW50KSB7IHBhaXJzW2VsZW1lbnRdID0gZWxlbWVudCB9KVxuICByZXR1cm4gcGFpcnMgfVxuXG5cbnZhciBwYWlyc19mcm9tX29iamVjdHMgPSBmdW5jdGlvbiAoYXJncykge1xuICB2YXIgb2JqZWN0cyA9IGFyZ3NbJ29iamVjdHMnXVxuICAgICwgdGV4dCAgICA9IGFyZ3NbJ3RleHQnXVxuICAgICwgdmFsdWUgICA9IGFyZ3NbJ3ZhbHVlJ11cbiAgICAsIHBhaXJzICAgPSBbXVxuXG4gIF8uZm9yRWFjaChvYmplY3RzLCBmdW5jdGlvbihvYmplY3QpIHsgXG4gICAgcGFpcnNbb2JqZWN0W3RleHRdXSA9IG9iamVjdFt2YWx1ZV0gfSlcblxuICByZXR1cm4gcGFpcnMgfVxuXG5cbnZhciBvcHRpb25zX2Zyb21faGFzaCA9IGZ1bmN0aW9uIChwYWlycywgb3B0cykge1xuICB2YXIgb3B0aW9ucyA9IFtdXG4gICAgLCBzZWxlY3RlZCA9ICcnXG4gIF8uZm9ySW4ocGFpcnMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgIG9wdGlvbnMucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicrIHZhbHVlICsnXCIgJysgc2VsZWN0ZWQgKyc+Jysga2V5ICsnPC9vcHRpb24+JylcbiAgfSk7XG4gIHJldHVybiBvcHRpb25zXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2VuZXJhdGVfb3B0aW9uczogIGdlbmVyYXRlX29wdGlvbnNcbn0iXX0=
;