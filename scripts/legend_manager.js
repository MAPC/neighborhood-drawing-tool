/*

LegendManager

Creates and updates the legend, given the current dataset for the viewable map extent.

Public interface: 
  set_legend is passed the map, dataset, and field name being added to the extent.
  style is passed the property of a GeoJSON feature for styling before MapManager adds it to the map.

*/

var legend = L.control({position: 'bottomright'})
  , colors = [ '#FEFEFE'
             , '#D0D1E6'
             , '#A6BDDB'
             , '#67A9CF'
             , '#1C9099'
             , '#016C59' ]
  , breaks
  , field


var define_legend_breaks = function (data, field, callback) {
  breaks = []
  var intervals = 5
    , arr = _.map(data.features, function(elem) { return parseFloat( elem.properties[field] ) } )
    , max = _.max(arr)
    , min = _.min(arr)
    , dif = max-min
    , div = dif/intervals

  for (var i = 0; i <= intervals; i++ ) {
    num = min + ( i * div )
    num = parseFloat( num.toFixed(1) )
    breaks.push( num ) }

  if (callback) return callback(breaks)
}



var getBreakColor = function (breaks, prop) {

    return prop > breaks[5] ? colors[5] : 
           prop > breaks[4] ? colors[4] : 
           prop > breaks[3] ? colors[3] : 
           prop > breaks[2] ? colors[2] : 
           prop > breaks[1] ? colors[1] :
                              colors[0]

}


var style = function (feature) {
  return {
      fillColor: getBreakColor(breaks, feature.properties[field])
    , fillOpacity: 0.45
    , weight: 1
    , color: '#BBB'
    , opacity: 1
  }
}


var set_legend = function (args) {
  field = args['field']
  var map   = args['map']
  $('.info.legend').remove()

  define_legend_breaks( args['data'], field, function (breaks) {
    
    legend.onAdd = function () {
      var div    = L.DomUtil.create('div', 'info legend')
        , labels = [];

        // console.log('breaks inside')
        // console.log(breaks)
      
      div.innerHTML = "<h4>Legend</h4>"
      // loop through our intervals and generate a label with a colored square for each interval
      for (var i = 0; i < breaks.length-1; i++) {
        div.innerHTML +=
          '<i style="background:' + getBreakColor(breaks, breaks[i] + 1) + '"></i> ' +
          breaks[i] + (breaks[i + 1] ? '&ndash;' + breaks[i + 1] + '<br>' : '+') }

      // console.log('this is the div: ')
      // console.log(div)
      return div
    }

    // console.log('legend')
    // console.log(legend)

    // console.log('map.hasLayer(legend)')
    // console.log(map.hasLayer(legend))

    // map.removeControl(legend)
    legend.addTo(map)
  })
}


module.exports = {
    set_legend: set_legend
  , style: style
}