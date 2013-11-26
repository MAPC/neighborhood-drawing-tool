// TODO set up jQuery document ready
// TODO set up map

console.log('NDT')

var Mediator      = require('./mediator').mediator

var QueryManager  = require('./query_manager')
var DataManager   = require('./data_manager')
var SelectManager = require('./select_manager')
var MapManager    = require('./map_manager')


DataManager.get_topics( function (topics) {
  $('select#topic').html(
    SelectManager.generate_options(topics) )  })


$('select').on('change', function() {
  SelectManager.populate_next( $(this) ) })


$('select#field').on('change', function () {
  var field = $(this).val()
  var geo = $('select#geography option')[1],
      geo = $(geo)

  geo.attr('selected', true) // select first geography
  
  MapManager.set_overlay({
      table:     $('select#table').val()
    , field:     field
    , geography: geo.val() })
})


$('select#geography').on('change', function () {
  var geo = $(this).find(':selected')
  MapManager.set_overlay({ geography: geo.val() })  })





var map = MapManager.init_map()
MapManager.establish_map(map)


map.on('draw:created', function (drawing) {
  MapManager.set_study_area({ study_area: drawing.layer })  })


map.on('draw:edited', function (drawing) {
  console.log('draw#edited')  })


map.on('moveend', function(){
  MapManager.set_overlay({})  })










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
