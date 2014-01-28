

var Mediator      = require('./mediator').mediator

var MapManager    = require('./map_manager')
var QueryManager  = require('./query_manager')
var SelectManager = require('./select_manager')
var StateManager  = require('./state_manager')
var ReportManager = require('./report_manager')
var ZoomManager   = require('./zoom_manager')


QueryManager.topics( function (topics) {
  $('select#topic').html(        SelectManager.options_html(topics) )
  $('select#report-topic').html( SelectManager.options_html(topics) )
})


$('select').on('change', function() {
  SelectManager.populate_next( $(this) )
  console.log(StateManager.get_params())
})


$('select#topic').on('change', function () {
  StateManager.update_params({ topic: $(this).val() })
})


$('select#table').on('change', function () {
  StateManager.update_params({ table: $(this).val() })
})


$('select#field').on('change', function () {  
  // Get the value of the first summary level
  // TODO: or the value of the summary level appropriate for the zoom
  var geography = $($('select#geography option')[1]).val()
  StateManager.update_params({ field: $(this).val(), geography: geography })
  
  $('select#geography').val( geography )   // Change the box to reflect
  $("select#geography").trigger('change')  // Set as text

  MapManager.update_map()
})


$('select#geography').on('change', function () {
  StateManager.update_params({ geography: $(this).val() })
  MapManager.update_map()
})


var map = MapManager.init_map()
MapManager.establish_map(map)
StateManager.update_params({ map: map, zoom: map._zoom })


// TODO: these should be inside MapManager
map.on('draw:created', function (drawing) {
  MapManager.set_study_area({ study_area: drawing.layer })  })


map.on('draw:edited', function (drawing) {
  MapManager.set_study_area({ study_area: drawing.layer })  })


map.on('moveend', function () {
  MapManager.update_map()  })


map.on('zoomend', function () {
  var summary_level = ZoomManager.zoom_to_summary_level( this._zoom )
  // TODO: CAUTION: summary_level and geography might be the same
  StateManager.update_params({  zoom:          this._zoom
                              , summary_level: summary_level  })

  $("select#geography").val( summary_level ) // Set geography select
  $("select#geography").trigger('change')    // Set as text

  MapManager.update_map()
})


// FACTOR OUT
$('select#field, select#geography').on('change', function() {
  var selected = $(this).find(':selected')
  selected = $(selected).text()
  $(this).next('a').html( selected )
  $(this).hide()
  if($(this).attr('id') !== 'geography') $('select#geography').trigger('change')
})

$('a#field, a#geography').on('click', function() {
  $(this).prev().show()
  $(this).html('')
})





var report = ReportManager.init( $('#report'), $('#content') )

$('#add-report-topic').on('click', function() {
  var selected = $('select#report-topic').find(':selected')
  var value    = selected.val().toLowerCase()
  ReportManager.request_category(value, $('#report #content') )
})


$('#add-this-field').on('click', function() {
  console.log('the click')
  ReportManager.request_field()
})




// This is more what I imagined but it did not turn out that way. VVV


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
