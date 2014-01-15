//
// module StateManager
//
//

var params = {}
  , required = ['table', 'topic', 'field', 'geography']
  , has_drawing = false


var update_params = function (args) {
  if (!_.isArray(args)) { args = Array(args) }
  _.forEach(args, function(arg) {
    set_param(arg)
  })
}


var set_param = function (arg) {
  _.forIn(arg, function(value, key) { 
    params[key] = value })
}


var can_get_extent = function () {
  var can_it = true
  _.forEach(required, function(requirement) {
    // if params does not meet a requirement
    if(!params[requirement]) { can_it = false } })
  return can_it
}


var can_get_study_area = function () {
  return has_drawing && can_get_extent()
}


module.exports = {
    update_params:      update_params
  , can_get_extent:     can_get_extent
  , can_get_study_area: can_get_study_area
}