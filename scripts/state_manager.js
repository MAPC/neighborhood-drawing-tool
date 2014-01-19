//
// module StateManager
//
//

_ = require('lodash')
var params = {}
  , requirements = ['table', 'topic', 'field', 'geography', 'map']
//   , has_drawing = false


var get_requirements = function () {
  return requirements
}


var get_params = function () {
  return params
}


var update_params = function (args) {
  var args = args
  if ( _.isArray(args) ) { args = merge_args(args) }
  _.forIn(args, function(value, key){
    params[key] = value
  })
}


var merge_args = function (args) {
  var hash = {}
  _.forEach(args, function (arg) {
    if ( _.isObject(arg) ) { _.merge(hash, arg) }
  })
  return hash
}


var reset_params = function () {
  params = {}
}


var clear_requirements = function () {
  requirements = undefined
}


var can_get_extent = function () {
  throw_if_no_requirements()
  var can_it = false
  var keys = _.keys(params)
  if( _.isEqual( keys.sort(), requirements.sort() )) { can_it = true }
  return can_it
}


var throw_if_no_requirements = function () {
  if (_.isUndefined(requirements) || requirements.length === 0) {
    throw new Error('StateManager has no requirements.')
  }
}


// var can_get_study_area = function () {
//   return has_drawing && can_get_extent()
// }


module.exports = {
  update_params:        update_params
  , reset_params:       reset_params
  , get_params:         get_params      
  , get_requirements:   get_requirements
  , clear_requirements: clear_requirements
  , can_get_extent:     can_get_extent     }
//   , can_get_study_area: can_get_study_area
// }