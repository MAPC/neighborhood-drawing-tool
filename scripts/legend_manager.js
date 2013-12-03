/*

Legend Manager

Manages 

Single public interface, set_legend, is passed the map and the dataset being added to the extent.

*/

var legend = L.control({position: 'bottomright'});


var define_legend_breaks = function (data, field, callback) {
  console.log('data.features')
  console.log(data.features)

  var intervals = 5
    , arr = _.map(data.features, function(elem) { return parseFloat( elem.properties[field] ) } )
    , max = _.max(arr)
    , min = _.min(arr)
    , dif = max-min
    , div = dif/intervals
    , breaks = []


  console.log('arr')
  console.log(arr)
  
  console.log('max')
  console.log(max)
  
  console.log('min')
  console.log(min)
  
  console.log('dif')
  console.log(dif)
  
  console.log('div')
  console.log(div)
  
  console.log('breaks')
  console.log(breaks)
  


  for (var i = 0; i <= intervals; i++ ) {
    num = min + ( i * div )
    num = parseFloat( num.toFixed(1) )
    breaks.push( num ) }

  if (callback) return callback(breaks)
}



var getColor = function (breaks, prop) {

var colors = [ '#FEFEFE'
             , '#D0D1E6'
             , '#A6BDDB'
             , '#67A9CF'
             , '#1C9099'
             , '#016C59' ]

    return prop > breaks[5] ? colors[5] : 
           prop > breaks[4] ? colors[4] : 
           prop > breaks[3] ? colors[3] : 
           prop > breaks[2] ? colors[2] : 
           prop > breaks[1] ? colors[1] :
                              colors[0]

}


var set_legend = function (args) {
  var map  = args['map']
  $('.info.legend').remove()

  define_legend_breaks( args['data'], args['field'], function (breaks) {
    
    legend.onAdd = function () {
      var div    = L.DomUtil.create('div', 'info legend')
        , labels = [];

        console.log('breaks inside')
        console.log(breaks)
      
      div.innerHTML = "<h4>Legend</h4>"
      // loop through our intervals and generate a label with a colored square for each interval
      for (var i = 0; i < breaks.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(breaks, breaks[i] + 1) + '"></i> ' +
          breaks[i] + (breaks[i + 1] ? '&ndash;' + breaks[i + 1] + '<br>' : '+') }

      console.log('this is the div: ')
      console.log(div)
      return div
    }

    console.log('legend')
    console.log(legend)

    console.log('map.hasLayer(legend)')
    console.log(map.hasLayer(legend))

    // map.removeControl(legend)
    legend.addTo(map)
  })
}

module.exports = {
  set_legend: set_legend
}