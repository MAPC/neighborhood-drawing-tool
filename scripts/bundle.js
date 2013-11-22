;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var QueryManager = require('./query_manager')

var get_topics = function (callback) {
  console.log('DataManager#get_topics')
  var categories = []

  QueryManager.meta('tabular', 'list', 'verbose', function(data) { 
    // console.log( 'QueryManager#meta with data: ' + data )
    
    _.forEach(data, function (table) {
      categories.push(table['category']) })
    if (callback) { callback( _.unique(categories) ) }
  })
}


var get_tables = function (category, callback) {
  console.log( 'DataManager#get_tables' )
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
  console.log('DataManager#get_fields')
  var table    = args['table'],
      callback = args['callback']
  
  QueryManager.meta('tabular', table, 'meta', function(data) { 
    if (callback) { callback( data.attributes ) }
  })
}

var get_geographies = function (args) {
  console.log('DataManager#get_fields')
  var table    = args['table'],
      callback = args['callback']
  
  QueryManager.meta('tabular', table, 'meta', function(data) { 
    if (callback) { callback( data.summary_levels ) }
  })
}


var get = function (args) {
  console.log('DataManager#get')
  console.log('GET'+ args['data'] +' where '+ args['from'] +' = '+ args['using'] +'.' ) }


module.exports = {
    get_topics:  get_topics
  , get_tables:  get_tables
  , get_fields:  get_fields
  , get_geographies: get_geographies 
}
},{"./query_manager":3}],2:[function(require,module,exports){
console.log('allo allo')

var QueryManager  = require('./query_manager')
var DataManager   = require('./data_manager')
var SelectManager = require('./select_manager')


DataManager.get_topics( function (topics) {
  $('select#topic').html( SelectManager.generate_options(topics) )
})

DataManager.get_tables('Transportation', function (tables) {
  $('select#table').html( SelectManager.generate_options(tables, {text: 'title', value: 'name'}) )
})

DataManager.get_fields({table: 'means_transportation_to_work_by_residence', callback: function (fields) {
  $('select#field').html( SelectManager.generate_options(fields, {text: 'alias', value: 'field_name'}) )
}})

DataManager.get_geographies({table: 'means_transportation_to_work_by_residence', callback: function (sumlevs) {
  $('select#geography').html( SelectManager.generate_options(sumlevs, {text: 'name', value: 'key'}) )
}})
},{"./data_manager":1,"./query_manager":3,"./select_manager":4}],3:[function(require,module,exports){
var api_base = 'http://localhost:2474'

var meta = function () {
  console.log('QueryManager#meta with args: ')
  console.log(arguments)
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
  console.log('url:' + url)

  $.ajax({
    url: url,
    type: type,
    success: function (data) {
      console.log( 'SUCCESS: ' )
      // console.log( data )
      if (callback) callback(data)
      },
    error: function (e) {
      console.log( 'ERROR: ' )
      console.log( e ) }
  })
}

module.exports = { meta: meta }
},{}],4:[function(require,module,exports){
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
  if (_.isString(pairs[0])) {
    pairs = pairs_from_array(pairs) }
  else if (_.isObject(pairs[0])) {
    pairs = pairs_from_objects({ objects: pairs, text: text, value: value }) 
    console.log(pairs) }


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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFwY3VzZXIvUHJvamVjdHMvbmVpZ2hib3Job29kLWRyYXdpbmctdG9vbC9zY3JpcHRzL2RhdGFfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvbWFpbi5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvcXVlcnlfbWFuYWdlci5qcyIsIi9Vc2Vycy9tYXBjdXNlci9Qcm9qZWN0cy9uZWlnaGJvcmhvb2QtZHJhd2luZy10b29sL3NjcmlwdHMvc2VsZWN0X21hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUXVlcnlNYW5hZ2VyID0gcmVxdWlyZSgnLi9xdWVyeV9tYW5hZ2VyJylcblxudmFyIGdldF90b3BpY3MgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgY29uc29sZS5sb2coJ0RhdGFNYW5hZ2VyI2dldF90b3BpY3MnKVxuICB2YXIgY2F0ZWdvcmllcyA9IFtdXG5cbiAgUXVlcnlNYW5hZ2VyLm1ldGEoJ3RhYnVsYXInLCAnbGlzdCcsICd2ZXJib3NlJywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICAvLyBjb25zb2xlLmxvZyggJ1F1ZXJ5TWFuYWdlciNtZXRhIHdpdGggZGF0YTogJyArIGRhdGEgKVxuICAgIFxuICAgIF8uZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodGFibGUpIHtcbiAgICAgIGNhdGVnb3JpZXMucHVzaCh0YWJsZVsnY2F0ZWdvcnknXSkgfSlcbiAgICBpZiAoY2FsbGJhY2spIHsgY2FsbGJhY2soIF8udW5pcXVlKGNhdGVnb3JpZXMpICkgfVxuICB9KVxufVxuXG5cbnZhciBnZXRfdGFibGVzID0gZnVuY3Rpb24gKGNhdGVnb3J5LCBjYWxsYmFjaykge1xuICBjb25zb2xlLmxvZyggJ0RhdGFNYW5hZ2VyI2dldF90YWJsZXMnIClcbiAgdmFyIHRhYmxlcyA9IFtdXG5cbiAgUXVlcnlNYW5hZ2VyLm1ldGEoJ3RhYnVsYXInLCAnbGlzdCcsICd2ZXJib3NlJywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICAvLyBjb25zb2xlLmxvZyggJ1F1ZXJ5TWFuYWdlciNtZXRhIHdpdGggZGF0YTogJyArIGRhdGEgKVxuICAgIF8uZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodGFibGUpIHtcbiAgICAgIGlmICggdGFibGVbJ2NhdGVnb3J5J10gPT09IGNhdGVnb3J5ICl7XG4gICAgICAgIHRhYmxlcy5wdXNoKCB0YWJsZSApXG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAoY2FsbGJhY2spIHsgY2FsbGJhY2sodGFibGVzKSB9XG4gIH0pXG59XG5cblxudmFyIGdldF9maWVsZHMgPSBmdW5jdGlvbiAoYXJncykge1xuICBjb25zb2xlLmxvZygnRGF0YU1hbmFnZXIjZ2V0X2ZpZWxkcycpXG4gIHZhciB0YWJsZSAgICA9IGFyZ3NbJ3RhYmxlJ10sXG4gICAgICBjYWxsYmFjayA9IGFyZ3NbJ2NhbGxiYWNrJ11cbiAgXG4gIFF1ZXJ5TWFuYWdlci5tZXRhKCd0YWJ1bGFyJywgdGFibGUsICdtZXRhJywgZnVuY3Rpb24oZGF0YSkgeyBcbiAgICBpZiAoY2FsbGJhY2spIHsgY2FsbGJhY2soIGRhdGEuYXR0cmlidXRlcyApIH1cbiAgfSlcbn1cblxudmFyIGdldF9nZW9ncmFwaGllcyA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gIGNvbnNvbGUubG9nKCdEYXRhTWFuYWdlciNnZXRfZmllbGRzJylcbiAgdmFyIHRhYmxlICAgID0gYXJnc1sndGFibGUnXSxcbiAgICAgIGNhbGxiYWNrID0gYXJnc1snY2FsbGJhY2snXVxuICBcbiAgUXVlcnlNYW5hZ2VyLm1ldGEoJ3RhYnVsYXInLCB0YWJsZSwgJ21ldGEnLCBmdW5jdGlvbihkYXRhKSB7IFxuICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayggZGF0YS5zdW1tYXJ5X2xldmVscyApIH1cbiAgfSlcbn1cblxuXG52YXIgZ2V0ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgY29uc29sZS5sb2coJ0RhdGFNYW5hZ2VyI2dldCcpXG4gIGNvbnNvbGUubG9nKCdHRVQnKyBhcmdzWydkYXRhJ10gKycgd2hlcmUgJysgYXJnc1snZnJvbSddICsnID0gJysgYXJnc1sndXNpbmcnXSArJy4nICkgfVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldF90b3BpY3M6ICBnZXRfdG9waWNzXG4gICwgZ2V0X3RhYmxlczogIGdldF90YWJsZXNcbiAgLCBnZXRfZmllbGRzOiAgZ2V0X2ZpZWxkc1xuICAsIGdldF9nZW9ncmFwaGllczogZ2V0X2dlb2dyYXBoaWVzIFxufSIsImNvbnNvbGUubG9nKCdhbGxvIGFsbG8nKVxuXG52YXIgUXVlcnlNYW5hZ2VyICA9IHJlcXVpcmUoJy4vcXVlcnlfbWFuYWdlcicpXG52YXIgRGF0YU1hbmFnZXIgICA9IHJlcXVpcmUoJy4vZGF0YV9tYW5hZ2VyJylcbnZhciBTZWxlY3RNYW5hZ2VyID0gcmVxdWlyZSgnLi9zZWxlY3RfbWFuYWdlcicpXG5cblxuRGF0YU1hbmFnZXIuZ2V0X3RvcGljcyggZnVuY3Rpb24gKHRvcGljcykge1xuICAkKCdzZWxlY3QjdG9waWMnKS5odG1sKCBTZWxlY3RNYW5hZ2VyLmdlbmVyYXRlX29wdGlvbnModG9waWNzKSApXG59KVxuXG5EYXRhTWFuYWdlci5nZXRfdGFibGVzKCdUcmFuc3BvcnRhdGlvbicsIGZ1bmN0aW9uICh0YWJsZXMpIHtcbiAgJCgnc2VsZWN0I3RhYmxlJykuaHRtbCggU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKHRhYmxlcywge3RleHQ6ICd0aXRsZScsIHZhbHVlOiAnbmFtZSd9KSApXG59KVxuXG5EYXRhTWFuYWdlci5nZXRfZmllbGRzKHt0YWJsZTogJ21lYW5zX3RyYW5zcG9ydGF0aW9uX3RvX3dvcmtfYnlfcmVzaWRlbmNlJywgY2FsbGJhY2s6IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgJCgnc2VsZWN0I2ZpZWxkJykuaHRtbCggU2VsZWN0TWFuYWdlci5nZW5lcmF0ZV9vcHRpb25zKGZpZWxkcywge3RleHQ6ICdhbGlhcycsIHZhbHVlOiAnZmllbGRfbmFtZSd9KSApXG59fSlcblxuRGF0YU1hbmFnZXIuZ2V0X2dlb2dyYXBoaWVzKHt0YWJsZTogJ21lYW5zX3RyYW5zcG9ydGF0aW9uX3RvX3dvcmtfYnlfcmVzaWRlbmNlJywgY2FsbGJhY2s6IGZ1bmN0aW9uIChzdW1sZXZzKSB7XG4gICQoJ3NlbGVjdCNnZW9ncmFwaHknKS5odG1sKCBTZWxlY3RNYW5hZ2VyLmdlbmVyYXRlX29wdGlvbnMoc3VtbGV2cywge3RleHQ6ICduYW1lJywgdmFsdWU6ICdrZXknfSkgKVxufX0pIiwidmFyIGFwaV9iYXNlID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MjQ3NCdcblxudmFyIG1ldGEgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCdRdWVyeU1hbmFnZXIjbWV0YSB3aXRoIGFyZ3M6ICcpXG4gIGNvbnNvbGUubG9nKGFyZ3VtZW50cylcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcChbYXJncy5sZW5ndGgtMV0pXG4gIHF1ZXJ5X3BhdGggPSAnLycgKyBhcmdzLmpvaW4oXCIvXCIpXG4gIHJlcXVlc3QoeyBcbiAgICBwYXRoOiBxdWVyeV9wYXRoLFxuICAgIGNhbGxiYWNrOiBjYWxsYmFjayB9KVxufVxuXG52YXIgcmVxdWVzdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgdmFyIGNhbGxiYWNrID0gYXJnc1snY2FsbGJhY2snXVxuICBjb25zb2xlLmxvZygnUXVlcnlNYW5hZ2VyI3JlcXVlc3Qgd2l0aCBhcmdzOiAnKVxuICBjb25zb2xlLmxvZyhhcmdzKVxuICB2YXIgYmFzZSA9IGFyZ3NbJ2FwaV9iYXNlJ10gICB8fCBhcGlfYmFzZVxuICAgICwgcGF0aCA9IGFyZ3NbJ3BhdGgnXSAgICAgICB8fCAnLydcbiAgICAsIG9wdHMgPSBhcmdzWydxdWVyeV9hcmdzJ10gfHwgJydcbiAgICAsIHR5cGUgPSBhcmdzWydtZXRob2QnXSAgICAgfHwgJ0dFVCdcbiAgICAsIGRhdGEgPSBhcmdzWydkYXRhJ10gICAgICAgfHwgbnVsbFxuXG4gIHZhciB1cmwgPSBiYXNlICsgcGF0aCArIG9wdHNcbiAgY29uc29sZS5sb2coJ3VybDonICsgdXJsKVxuXG4gICQuYWpheCh7XG4gICAgdXJsOiB1cmwsXG4gICAgdHlwZTogdHlwZSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coICdTVUNDRVNTOiAnIClcbiAgICAgIC8vIGNvbnNvbGUubG9nKCBkYXRhIClcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZGF0YSlcbiAgICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ0VSUk9SOiAnIClcbiAgICAgIGNvbnNvbGUubG9nKCBlICkgfVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWV0YTogbWV0YSB9IiwiLy8gU2VsZWN0TWFuYWdlci5pbml0ID0gZnVuY3Rpb24gKCkge1xuLy8gICB2YXIgdG9waWMgICAgID0gJCgnc2VsZWN0I3RvcGljJylcbi8vICAgICAsIHRhYmxlICAgICA9ICQoJ3NlbGVjdCN0YWJsZScpXG4vLyAgICAgLCBmaWVsZCAgICAgPSAkKCdzZWxlY3QjZmllbGQnKVxuLy8gICAgICwgZ2VvZ3JhcGh5ID0gJCgnc2VsZWN0I2dlb2dyYXBoeScpXG4vLyAgICAgLCBzZWxlY3RzID0gW3RvcGljLCB0YWJsZSwgZmllbGQsIGdlb2dyYXBoeV1cblxuLy8gICBfLmZvckVhY2goc2VsZWN0cywgZnVuY3Rpb24gKHNlbGVjdCkge1xuLy8gICAgIFNlbGVjdE1hbmFnZXIucG9wdWxhdGUoIHNlbGVjdCwgIClcbi8vICAgfSlcbi8vIH1cblxuLy8gU2VsZWN0TWFuYWdlci51cGRhdGVfY29udHJvbHMgPSBmdW5jdGlvbiAoYXJncykge1xuLy8gICBjb25zb2xlLmxvZygnU2VsZWN0TWFuYWdlciN1cGRhdGVfY29udHJvbHMgd2l0aCBhcmdzOiAnICsgYXJncylcbi8vICAgU2VsZWN0TWFuYWdlci5wb3B1bGF0ZSh7IGVsZW1lbnQ6IGFyZ3NbJ3RvX3VwZGF0ZSddXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgLCB1c2luZzogICBhcmdzWydzZWxlY3RlZCddXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgLCBmcm9tOiAgICBhcmdzWydjaGFuZ2VkJ10gXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB9KSB9XG5cblxuLy8gU2VsZWN0TWFuYWdlci5wb3B1bGF0ZSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4vLyAgIGNvbnNvbGUubG9nKCdTZWxlY3RNYW5hZ2VyI3BvcHVsYXRlIHdpdGggYXJnczogJyArIGFyZ3MpXG4vLyAgIHZhciBlbGVtZW50ID0gYXJnc1snZWxlbWVudCddICAgLy8gdGFibGUgc2VsZWN0XG4vLyAgICAgLCB1c2luZyAgID0gYXJnc1sndXNpbmcnXSAgICAgLy8gdG9waWMgb3B0aW9uXG4vLyAgICAgLCBjaGFuZ2VkID0gYXJnc1snY2hhbmdlZCddICAgLy8gdG9waWMgc2VsZWN0XG4vLyAgIC8vIGdldCggJ3RhYmxlJywgJ3RvcGljJywgJ3RyYW5zcG9ydGF0aW9uJyApXG4vLyAgIHZhciBwYWlycyA9IERhdGFNYW5hZ2VyLmdldCh7IGRhdGE6IGVsZW1lbnQuaWQsIGZyb206IGNoYW5nZWQuaWQsIHVzaW5nOiB1c2luZy52YWx1ZSB9KVxuLy8gICB2YXIgb3B0aW9ucyA9IFNlbGVjdE1hbmFnZXIuZ2VuZXJhdGVfb3B0aW9ucyhwYWlycywgeyBwbGFjZWhvbGRlcjogJ1NlbGVjdCcgKyBlbGVtZW50LmlkIH0pXG4vLyAgIGVsZW1lbnQuaHRtbChvcHRpb25zKSB9XG5cblxudmFyIGdlbmVyYXRlX29wdGlvbnMgPSBmdW5jdGlvbiAocGFpcnMsIG9wdHMpIHtcbiAgdmFyIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgLCBwbGFjZWhvbGRlciA9IG9wdHNbJ3BsYWNlaG9sZGVyJ10gfHwgXCJDaG9vc2Ugb25lXCJcbiAgICAsIHRleHQgPSBvcHRzWyd0ZXh0J11cbiAgICAsIHZhbHVlID0gb3B0c1sndmFsdWUnXVxuICAgICwgb3B0aW9ucyA9IFtdXG4gIGNvbnNvbGUubG9nKFwicGFpcnNcIilcbiAgY29uc29sZS5sb2cocGFpcnMpXG4gIGlmIChfLmlzU3RyaW5nKHBhaXJzWzBdKSkge1xuICAgIHBhaXJzID0gcGFpcnNfZnJvbV9hcnJheShwYWlycykgfVxuICBlbHNlIGlmIChfLmlzT2JqZWN0KHBhaXJzWzBdKSkge1xuICAgIHBhaXJzID0gcGFpcnNfZnJvbV9vYmplY3RzKHsgb2JqZWN0czogcGFpcnMsIHRleHQ6IHRleHQsIHZhbHVlOiB2YWx1ZSB9KSBcbiAgICBjb25zb2xlLmxvZyhwYWlycykgfVxuXG5cbiAgb3B0aW9ucy5wdXNoKCc8b3B0aW9uIHZhbHVlPVwiXCI+JyArIHBsYWNlaG9sZGVyICsgJzwvb3B0aW9uPicpXG4gIG9wdGlvbnMucHVzaCggb3B0aW9uc19mcm9tX2hhc2gocGFpcnMsIG9wdHMpIClcbiAgcmV0dXJuIG9wdGlvbnMuam9pbihcIlxcblwiKSB9XG5cblxudmFyIHBhaXJzX2Zyb21fYXJyYXkgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgdmFyIHBhaXJzID0ge31cbiAgXy5mb3JFYWNoKGFycmF5LCBmdW5jdGlvbihlbGVtZW50KSB7IHBhaXJzW2VsZW1lbnRdID0gZWxlbWVudCB9KVxuICByZXR1cm4gcGFpcnMgfVxuXG5cbnZhciBwYWlyc19mcm9tX29iamVjdHMgPSBmdW5jdGlvbiAoYXJncykge1xuICB2YXIgb2JqZWN0cyA9IGFyZ3NbJ29iamVjdHMnXVxuICAgICwgdGV4dCAgICA9IGFyZ3NbJ3RleHQnXVxuICAgICwgdmFsdWUgICA9IGFyZ3NbJ3ZhbHVlJ11cbiAgICAsIHBhaXJzICAgPSBbXVxuXG4gIF8uZm9yRWFjaChvYmplY3RzLCBmdW5jdGlvbihvYmplY3QpIHsgXG4gICAgcGFpcnNbb2JqZWN0W3RleHRdXSA9IG9iamVjdFt2YWx1ZV0gfSlcblxuICByZXR1cm4gcGFpcnMgfVxuXG5cbnZhciBvcHRpb25zX2Zyb21faGFzaCA9IGZ1bmN0aW9uIChwYWlycywgb3B0cykge1xuICB2YXIgb3B0aW9ucyA9IFtdXG4gICAgLCBzZWxlY3RlZCA9ICcnXG4gIF8uZm9ySW4ocGFpcnMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgIG9wdGlvbnMucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicrIHZhbHVlICsnXCIgJysgc2VsZWN0ZWQgKyc+Jysga2V5ICsnPC9vcHRpb24+JylcbiAgfSk7XG4gIHJldHVybiBvcHRpb25zXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2VuZXJhdGVfb3B0aW9uczogIGdlbmVyYXRlX29wdGlvbnNcbn0iXX0=
;