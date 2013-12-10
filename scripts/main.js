

var Mediator      = require('./mediator').mediator

var DataManager   = require('./data_manager')
var MapManager    = require('./map_manager')
var QueryManager  = require('./query_manager')
var SelectManager = require('./select_manager')
var ReportManager = require('./report_manager')
var ZoomManager   = require('./zoom_manager')


DataManager.get_topics( function (topics) {
  $('select#topic').html(
    SelectManager.generate_options(topics) )  })


$('select').on('change', function() {
  SelectManager.populate_next( $(this) )
})


$('select#field').on('change', function () {
  var field = $(this).val()
  var geo = $('select#geography option')[1],
      geo = $(geo)

  geo.attr('selected', true) // select first geography
  
  if ( MapManager.has_study_area() ) {
    MapManager.set_study_area({
      table:     $('select#table').val()
    , field:     field
    , geography: geo.val() })
  }

  MapManager.set_overlay({
      table:     $('select#table').val()
    , field:     field
    , geography: geo.val() })
})


$('select#geography').on('change', function () {
  var geo = $(this).find(':selected')
  if ( MapManager.has_study_area() ) {
    MapManager.set_study_area({ geography: geo.val() }) }
  MapManager.set_overlay({ geography: geo.val() })  
})




var map = MapManager.init_map()
MapManager.establish_map(map)


map.on('draw:created', function (drawing) {
  MapManager.set_study_area({ study_area: drawing.layer })  })


map.on('draw:edited', function (drawing) {
  MapManager.set_study_area({ study_area: drawing.layer })  })


map.on('moveend', function () {
  MapManager.set_overlay({})  })


map.on('zoomend', function () {
  console.log( 'zoom: ' + map.getZoom() )

  var set_zoom_selects = function (sumlevs) {
    console.log('summary levels: ' + sumlevs)
    var value = ZoomManager.appropriate_sumlev(map, sumlevs)
    console.log(value)
    $("select#geography").val(value)
    $("select#geography").trigger('change')
  }

  var table = $('select#table').val()
  console.log('table: ' + table)
  DataManager.get_geographies({
    table: table,
    callback: set_zoom_selects
  })
})

$('select#field, select#geography').on('change', function() {
  var selected = $(this).find(':selected')
  selected = $(selected).text()
  $(this).next('a').html( selected )
  $(this).hide()
  console.log('selected.length')
  console.log(selected.length)
  if(selected.length > 45){
    console.log('======== longer')
    console.log($('#title-bar a'))
    $('#title-bar a').css('font-size-adjust', '0.3')
  } else {
    console.log('======== shorter')
    $('#title-bar a').css('font-size-adjust', '0.0')
  }
  if($(this).attr('id') !== 'geography') $('select#geography').trigger('change')
})

$('a#field, a#geography').on('click', function() {
  $(this).prev().show()
  $(this).html('')
})





var report = ReportManager.init( $('#report'), $('#content') )
console.log(report.content)
ReportManager.display_report(report.content)



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
