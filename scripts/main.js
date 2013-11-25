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

var baseLayers = {
  "Metropolitan": tiles,
  // "MAPC": tiles2
}

var map = L.map('map', {
    center: new L.LatLng(42.4, -71.8)
  , zoom: 11
  , layers: tiles
})

var layer_control = L.control.layers(baseLayers).addTo(map)






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
