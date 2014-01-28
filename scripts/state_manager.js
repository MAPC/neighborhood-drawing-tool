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

var geo_params = function () {
  var geo = { table:     params.table
            , field:     params.field
            , geography: params.geography }
  console.log(geo)
  return geo
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
  return meets_requirements(requirements, _.keys(params))
}


var meets_requirements = function (reqs, params) {
  var it_does = false
    , count  = 0

  _.forEach(reqs, function (req) {
    if (params.indexOf(req) != -1) { count = count + 1 } })
  
  if (count === reqs.length) { it_does = true }
  return it_does
}


var throw_if_no_requirements = function () {
  if (_.isUndefined(requirements) || requirements.length === 0) {
    throw new Error('StateManager has no requirements.')
  }
}


var can_get_study_area = function () {
  return params.drawing && can_get_extent()
}


module.exports = {
    update_params:      update_params
  , reset_params:       reset_params
  , get_params:         get_params
  , geo_params:         geo_params
  , get_requirements:   get_requirements
  , clear_requirements: clear_requirements
  , can_get_extent:     can_get_extent     
  , can_get_study_area: can_get_study_area }