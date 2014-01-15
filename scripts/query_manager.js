var api_base = 'http://localhost:2474'


var get_site = function() { return api_base }


var topics   = function () {
  return request()
}


var tables = function (topic) {
  if (topic == undefined) { throw new Error('No topic defined for #tables().') }
  return Array({title: 'Gross Rent', value: 'rent'})
}


module.exports = { get_site: get_site
                 , topics: topics
                 , tables: tables }



// PRIVATE

var request = function (args) {
  return [ { title: 'Transportation', value: 'transportation' }
         , { title: 'Economy', value: 'economy' } ]
}



// var meta = function () {
//   // console.log('QueryManager#meta with args: ')
//   // console.log(arguments)
//   var args = Array.prototype.slice.call(arguments);
//   var callback = args.pop([args.length-1])
//   query_path = '/' + args.join("/")
//   request({ 
//     path: query_path,
//     callback: callback })
// }

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
//   // console.log('url:' + url)

//   $.ajax({
//     url: url,
//     type: type,
//     success: function (data) {
//       // console.log( 'SUCCESS: ' )
//       // console.log( data )
//       if (callback) callback(data)
//       },
//     error: function (e) {
//       console.log( 'ERROR: ' )
//       console.log( e ) }
//   })
// }
