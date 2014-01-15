var api_base = 'http://localhost:2474'

var get_site = function() { return api_base }


var topics   = function () {
  request({
    callback: function(data) { return data }
  })
}


var tables = function (topic) {
  if (topic == undefined) { throw new Error('No topic defined for #tables().') }
  return Array({title: 'Gross Rent', value: 'rent'})
}


module.exports = { get_site: get_site
                 , topics:   topics
                 , tables:   tables   }



// PRIVATE

var request = function (args) {
  console.log(args.callback)
  jQuery.ajax({
      url: api_base + '/topics'
    , type: 'GET'
    // , contentType: 'application/json'
    , success: function (data) { args.callback(data) }
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
