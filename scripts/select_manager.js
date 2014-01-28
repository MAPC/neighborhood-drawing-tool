var QueryManager = require('./query_manager')
  , StateManager = require('./state_manager')  


var options_html = function (collection) {
  var placeholder  = '<option value = "">Choose one</option>'
  var options      = option_tags(collection).join("\n")
  return placeholder + options
}


var option_tags = function (collection) {
  var option_tags = [] 
  _.forEach(collection, function (item) {
    option_tags.push( option_tag(item.data.title, item.data.value) ) 
  })
  return option_tags
}


var option_tag = function (title, value) {
  return '<option value="'+ value +'">'+ title +'</option>'
}



// TODO: get the select box to know how to get their own values

var populate_next = function (obj) {
  var value = obj.val()
    , next  = obj.next( 'select' )
    , id    = obj.attr( 'id' )
    , opts  = {}

  switch (id) {
    case 'topic':
      QueryManager.tables(value, function (collection) {
        next.html( options_html(collection) )
      })
      break;
    case 'table':
      QueryManager.fields(value, function (collection) {
        next.html( options_html(collection) )
      })
      QueryManager.geographies(value,  function (collection) {
        $('select#geography').html( options_html(collection) )
        StateManager.update_params({ summary_levels: collection })
      })
      break;
  }
}


module.exports = {
    options_html:  options_html
  , populate_next: populate_next
}