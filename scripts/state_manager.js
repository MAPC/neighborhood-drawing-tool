//
// module StateManager
//
//

_ = require('lodash')
var params = {}
//   , required = ['table', 'topic', 'field', 'geography']
//   , has_drawing = false

var get_params = function () {
  return params
}

var update_params = function (args) {
  _.forIn(args, function(value, key){
    params[key] = value
  })
}

var reset_params = function () {
  params = {}
}

// var can_get_extent = function () {
//   var can_it = true
//   _.forEach(required, function(requirement) {
//     // if params does not meet a requirement
//     if(!params[requirement]) { can_it = false } })
//   return can_it
// }


// var can_get_study_area = function () {
//   return has_drawing && can_get_extent()
// }


module.exports = {
  update_params: update_params
  , reset_params: reset_params
  , get_params:   get_params      }
//   , can_get_extent:     can_get_extent
//   , can_get_study_area: can_get_study_area
// }