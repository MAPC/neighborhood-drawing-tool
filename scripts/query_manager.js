var _ = require('lodash')
var api_base = 'http://localhost:2474'

var get_site = function() { return api_base }


var topics   = function (callback) {
  request({ callback: callback })
}


var tables = function (topic, callback) {
  if (topic == undefined) { throw new Error('No topic defined for #tables().') }
  
  request({ topic:    topic.toLowerCase()
          , callback: callback            })
}


// fields
// geographies


module.exports = { get_site: get_site
                 , topics:   topics
                 , tables:   tables   }



// PRIVATE

var request = function (args) {
  topic = args.topic || ''
  // console.log(api_base + '/topics/' + topic)
  jQuery.ajax({
      url: api_base + '/topics/' + topic
    , type: 'GET'
    // , contentType: 'application/json'
    , success: function (data) {
        if (args.callback) {
          var data = data
          if (!_.isArray(data)) { data = Array(data) }
          args.callback(data)
        }
      }
    , error: function (e) { console.log('Error: ' + e) }
  })
}


// var request = function(args) {
//   var callback = args['callback']
//   // console.log('QueryManager#request with args: ')
//   // console.log(args)
//   var base = args['api_base']   || api_base
//     , path = args['path']       || '/'
//     , opts = args['query_args'] || ''
//     , type = args['method']     || 'GET'
//     , data = args['data']       || null
//   var url = base + path + opts
