//
// module MapManager
//
//

var StateManager = require('./state_manager')
  , QueryManager = require('./query_manager')


var table, field, geography, study_area
  , mapc_url      = 'http://tiles.mapc.org/basemap/{z}/{x}/{y}.png'
  , mapc_attrib   = 'Tiles by <a href="http://www.mapc.org/">Metropolitan Area Planning Council</a>.'
  , tiles         = L.tileLayer( mapc_url, { attribution: mapc_attrib } )
  , extent_layer  = new L.layerGroup()
  , study_layer   = new L.featureGroup()
  , drawing_layer = new L.featureGroup()
  , base_layers  = { 
      "MAPC Basemap": tiles }
  , over_layers  = {
      "Map Extent": extent_layer,
      "Study Area": drawing_layer }

var LegendManager = require('./legend_manager')
  , draw_color    = '#5597A7'
  , draw_options  = {
                      position: 'topleft',
                      draw: {
                      
                        polygon: {
                            title: 'Draw a study area polygon.'
                          , allowIntersection: false
                          , drawError: {
                                color: '#b00b00'
                              , timeout: 1000
                              , message: "Sorry! We can't handle that geometry."
                            },
                          shapeOptions: {
                            color: draw_color
                          },
                          showArea: true
                        },
                        
                        rectangle: {
                          title: 'Draw a rectangular study area.',
                          shapeOptions: {
                            color: draw_color
                          }
                        },
                        
                        circle:   false,
                        marker:   false,
                        polyline: false,
                      },
                      
                      edit: { featureGroup: drawing_layer }
                    }


var layer_control = L.control.layers( base_layers, over_layers )
  , draw_control = new L.Control.Draw( draw_options )


var map = L.map('map', {
      center: new L.LatLng(42.363364,-71.067494)
    , zoom: 15
    , layers: tiles })


var init_map = function () {
  return map
}


var establish_map = function (map) {
  extent_layer.addTo(map)
  study_layer.addTo(map)
  drawing_layer.addTo(map)
  layer_control.addTo(map)
  map.addControl(draw_control)
}









var update_map = function () {
  console.log('update map')
  if ( StateManager.can_get_extent() ) {
    update_extent()

    if ( StateManager.can_get_study_area() ) {
      update_study_area() }
  }
}


var update_extent = function () {
  // TODO: geo_params
  console.log('update extent')
  bounds = L.rectangle( map.getBounds() ).toGeoJSON()
  QueryManager.geo_query( StateManager.geo_params(), bounds, function (layer) {
    replace_layer( extent_layer, { using: layer } )
    // LegendManager.refresh()
  })
}


var update_study_area = function () {
  console.log('update study area')
      
  QueryManager.geo_query( StateManager.geo_params(), study_area.toGeoJSON(), function (layer) {
    replace_layer( study_area_layer, { using: layer } )
    update_drawing( layer )  
  })
}


var update_drawing = function (layer) {
  // var poly_bounds = layer.outer_bounds HOW
  replace_layer( drawing_layer, { using: poly_bounds } )
}


var replace_layer = function (layer_to_replace, args) {
  layer_to_replace.clearLayers()
  layer_to_replace.addLayer( make_styled_geojson( args.using ) )
}


var make_styled_geojson = function (data) {
  // TODO: return L.geoJson( data, { style: style_or_default() } )
  return L.geoJson( data, { style: default_style } )
}


var style_or_default = function () {
  return LegendManager.style() || default_style
}


var default_style = function (feature) {
  return {
      fillColor: '#FFF'
    , fillOpacity: 0.45
    , weight: 1
    , color: '#BBB'
    , opacity: 1
  }
}

/*

MapManager



*/





var set_overlay = function(args) {
  console.log('MapManager#set_overlay')
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


var set_study_area = function(args){
  console.log('MapManager#set_study_area')
  
  drawing_layer.addLayer( study_area )

  get_layer({
      table:     table
    , field:     field
    , geography: geography
    , polygon:   study_area.toGeoJSON()
    , add_to:    study_layer }) 
}


var get_table = function () {
  return table }


var has_study_area = function () {
  if (typeof study_area != 'undefined') { return true }
  return false }


// public interface

module.exports = {
    init_map:       init_map
  , establish_map:  establish_map
  , set_overlay:    set_overlay
  , set_study_area: set_study_area
  , has_study_area: has_study_area
  , update_map:     update_map
}

// private

