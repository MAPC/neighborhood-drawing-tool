var DataManager = require('./data_manager')


var options_html = function (collection) {
  var placeholder  = '<option value = "">Choose one</option>'
  var options      = option_tags(collection).join("\n")
  return placeholder + options
}


var option_tags = function (collection) {
  var option_tags = [] 
  _.forEach(collection, function (item) {
    console.log(item.data.title, item.data.value)
    option_tags.push( option_tag(item.data.title, item.data.value) ) 
  })
  return option_tags
}


var option_tag = function (title, value) {
  return '<option value="'+ value +'">'+ title +'</option>'
}




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
    options_html:      options_html
  , generate_options:  generate_options
  , populate_next:     populate_next
}