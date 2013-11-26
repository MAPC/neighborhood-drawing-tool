// TODO set up jQuery document ready
// TODO set up map

console.log('allo allo')

var Mediator      = require('./mediator').mediator

var QueryManager  = require('./query_manager')
var DataManager   = require('./data_manager')
var SelectManager = require('./select_manager')


DataManager.get_topics( function (topics) {
  $('select#topic').html(
    SelectManager.generate_options(topics) )
})

// DataManager.get_tables('Transportation', function (tables) {
//   $('select#table').html(
//     SelectManager.generate_options(tables, {text: 'title', value: 'name'}) )
// })

// DataManager.get_fields({table: 'means_transportation_to_work_by_residence', callback: function (fields) {
//   $('select#field').html(
//     SelectManager.generate_options(fields, {text: 'alias', value: 'field_name'}) )
// }})

// DataManager.get_geographies({table: 'means_transportation_to_work_by_residence', callback: function (sumlevs) {
//   $('select#geography').html(
//     SelectManager.generate_options(sumlevs, {text: 'name', value: 'key'}) )
// }})





// DataManager.get_fields({table: table, callback: function (fields) {
//   next.html(
//     SelectManager.generate_options(fields,
//      { text: 'alias'
//      , value: 'field_name' }) )
//   }})
// }

$('select').on('change', function() {
  SelectManager.populate_next( $(this) ) })


var mapc_url    = 'http://tiles.mapc.org/basemap/{z}/{x}/{y}.png'
  , mapc_attrib = 'Tiles by <a href="http://www.mapc.org/">MAPC</a>.'


// var hey = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
//     key: 'd4fc77ea4a63471cab2423e66626cbb6',
//     attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     styleId: 22677
//   });


var tiles  = L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
              attribution: 'Tiles by <a href="http://www.mapc.org/">Metropolitan Area Planning Council</a>.' })
  // , tiles2 = L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
  //             attribution: 'Tiles by <a href="http://www.mapc.org/">MAPC</a>.' })

var map = L.map('map', {
    center: new L.LatLng(42.4, -71.8)
  , zoom: 11
  , layers: tiles
})


var base_layers = {
  "MAPC Basemap": tiles,
  // "MAPC": tiles2
}

var extent_layer = L.layerGroup().addTo(map),
    study_layer  = L.featureGroup().addTo(map)

var over_layers = {
  "Map Extent": extent_layer,
  "Study Area": study_layer
}

var layer_control = L.control.layers(base_layers, over_layers).addTo(map)


// DRAW

var draw_control = new L.Control.Draw({
  draw: {
    position: 'topleft',
    polygon: {
      title: 'Draw your neighborhood!',
      allowIntersection: false,
      drawError: {
        color: '#b00b00',
        timeout: 1000 },
      shapeOptions: {
        color: '#2255BB' },
      showArea: true },
    polyline: false,
    marker: false },
  edit: {
    featureGroup: study_layer } });

map.addControl(draw_control);





var table      = ''
  , field      = ''
  , geography  = ''
  , study_area = ''

$('select#field').on('change', function () {
  console.log( 'table: ' + $('select#table').val() )
  var field = $(this).val()

  var geo = $('select#geography option')[1],
      geo = $(geo)

  geo.attr('selected', true) // select first geography
  set_overlay({
      table:     $('select#table').val()
    , field:     field
    , geography: geo.text() })
})

$('select#geography').on('change', function () {
  var geo = $(this).find(':selected')
  console.log(geo)

  set_overlay({ geography: geo.val() })
  // TODO: set_study_area
})

var set_overlay = function(args) {
  console.log('global#set_overlay')
  if( args.table )     { table     = args.table }
  if( args.field )     { field     = args.field }
  if( args.geography ) { geography = args.geography }

  if (typeof table === 'undefined' || typeof field === 'undefined' || typeof geography === 'undefined'){
    console.log('throw error')
  }

  get_layer({
      table:     table
    , field:     field
    , geography: geography
    , polygon:   L.rectangle( map.getBounds() ).toGeoJSON()
    , add_to:    extent_layer })
}


map.on('draw:created', function (drawing) {
  console.log('draw#created')
  var polygon = drawing.layer
  study_layer.addLayer( polygon )
  set_study_area({ study_area: polygon })
})

map.on('draw:edited', function (drawing) {
  console.log('draw#edited')
})

var set_study_area = function(args){
  console.log('global#set_study_area')
  if( args.table )      { table      = args.table }
  if( args.field )      { field      = args.field }
  if( args.geography )  { geography  = args.geography }
  if( args.study_area ) { study_area = args.study_area }

  if (typeof table === 'undefined' || typeof field === 'undefined' || typeof geography === 'undefined'){
    console.log('throw error')
  }

  get_layer({
      table:     table
    , field:     field
    , geography: geography
    , polygon:   study_area.toGeoJSON()
    , add_to:    study_layer }) 
}

// "TypeError: Cannot read property 'key' of undefined    at exports.dataset (/Users/mapcuser/Projects/datacommon-io/routes/geographic.js:46:23)    at callbacks (/Users/mapcuser/Projects/datacommon-io/node_modules/express/lib/router/index.js:164:37)    at param (/Users/mapcuser/Projects/datacommon-io/node_modules/express/lib/router/index.js:138:11)    at param (/Users/mapcuser/Projects/datacommon-io/node_modules/express/lib/router/index.js:135:11)    at param (/Users/mapcuser/Projects/datacommon-io/node_modules/express/lib/router/index.js:135:11)    at param (/Users/mapcuser/Projects/datacommon-io/node_modules/express/lib/router/index.js:135:11)    at pass (/Users/mapcuser/Projects/datacommon-io/node_modules/express/lib/router/index.js:145:5)    at nextRoute (/Users/mapcuser/Projects/datacommon-io/node_modules/express/lib/router/index.js:100:7)    at callbacks (/Users/mapcuser/Projects/datacommon-io/node_modules/express/lib/router/index.js:167:11)    at /Users/mapcuser/Projects/datacommon-io/app.js:41:3"

var get_layer = function(args) {
  console.log('global#get_layer')
  
  // args.geography = 'ma_census_tracts'

  var base_url = 'http://localhost:2474/geographic/spatial/'
    , url = base_url + args.geography + '/tabular/' + args.table + '/' + field + '/intersect'
    , polygon = args.polygon

  console.log(url)

  $.ajax({
      url: url
    , type: 'POST'
    , data: args.polygon.geometry
    , success: function (data) {
        console.log('global#get_layer: success. Now, the data:')
        console.log(data) 
        args.add_to.clearLayers()
        args.add_to.addLayer( L.geoJson(data) )
        console.log(args.add_to.getLayers())
      }
    , error: function(e) {
        console.log("ERROR")
        console.log(e) } })
}

map.on('moveend', function(){
  set_overlay({})
})

// map.on( 'load', function()     { Mediator.publish( 'map_loaded ') } )
// map.on( 'moveend', function () { Mediator.publish( 'map_moved' ) } )
// map.on( 'zoomend', function () { Mediator.publish( 'map_zoomed' ) } )

// Mediator.subscribe( 'map_loaded', MapManager.init() )
// Mediator.subscribe( 'map_moved',  MapManager.handle_move() )
// Mediator.subscribe( 'map_zoomed', MapManager.handle_zoom() )


// map.on( 'draw:create',  function (drawing) { Mediator.publish( 'figure_drawn' ) } )
// map.on( 'draw:edited',  function (drawing) { Mediator.publish( 'figure_edited' ) } )
// map.on( 'draw:deleted', function () { Mediator.publish( 'figure_deleted' ) } )

// Mediator.subscribe( 'figure_drawn',   StudyAreaManager.handle_draw( drawing ) )
// Mediator.subscribe( 'figure_edited',  StudyAreaManager.handle_edit( drawing ) )
// Mediator.subscribe( 'figure_deleted', StudyAreaManager.handle_delete() )


// $('select').on('change', function () {
//   var self  = $(this),
//       value = self.val() // TODO or something like this
//   if (self.id === 'field') {
//     Mediator.publish ( 'field_changed', value )
//   } else {
//     Mediator.publish( 'select_changed', {self: self, next: self.next(), value: value} ) }
// })

// Mediator.subscribe( 'select_changed', SelectManager.populate_next( args ) )
// Mediator.subscribe( 'field_changed',  MapManager.change_field( field ) )
