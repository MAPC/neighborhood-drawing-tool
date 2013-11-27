
var zoom_config = {
      8:  'municipality'
    , 12: ['census_tract', 'school_district']
    , 15: 'census_blockgroup' }


var arrayify = function (hash) {
  console.log('ZoomManager#arrayify')
  var max   = _.max( _.map(_.keys(hash), function (e) { return _.parseInt(e) } ))
    , array = Array(max) // TODO: or, map.maxZoom()

  _.each(hash, function(value, key) {
    array[key] = value })
  console.log(array)
  return array
}

var zoom_array = arrayify(zoom_config) 

var appropriate_sumlev = function (map, sumlevs) {
  var return_value
  console.log('ZoomManager#appropriate_sumlev')
  // returns a value like 'census_blockgroup'
  
  // starts at current zoom, unless that's too high
  var start_zoom = map.getZoom()
  if ( start_zoom > zoom_array.length ) start_zoom = zoom_array.length

  // console.log('start zoom: ' + start_zoom)
  // work back from closest to farthest
  for (var zoom = start_zoom; zoom > -1; zoom--){
    options = zoom_array[zoom]  // ret: 'census_blocks' or ['ct', 'sd']
    if (! _.isArray(options)) options = [options] // force to be Array

    _.each(options, function(option) {
      // console.log('option: ' + option)
      _.forIn(sumlevs, function (sumlev, key) {
        // console.log('sumlev: ' + sumlev.name)
        if (sumlev.name === option) {
          console.log('RETURNING ' + sumlev.name)
          return_value = sumlev.name
        }
      })  
    })
  }
  console.log('return_value: ' + return_value)
  return return_value
}

module.exports = {
  appropriate_sumlev: appropriate_sumlev
}