/*

MapManager



*/

var LegendManager = require('./legend_manager')

var table, field, geography, study_area
  , mapc_url     = 'http://tiles.mapc.org/basemap/{z}/{x}/{y}.png'
  , mapc_attrib  = 'Tiles by <a href="http://www.mapc.org/">Metropolitan Area Planning Council</a>.'
  , tiles        = L.tileLayer( mapc_url, { attribution: mapc_attrib } )
  , extent_layer = new L.layerGroup()
  , study_layer  = new L.featureGroup()
  , drawing_layer = new L.featureGroup()
  , base_layers  = { 
      "MAPC Basemap": tiles }
  , over_layers  = {
      "Map Extent": extent_layer,
      "Study Area": study_layer,
      "Drawing": drawing_layer }


var layer_control = L.control.layers(base_layers, over_layers)
  , draw_control = new L.Control.Draw({
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
        featureGroup: drawing_layer } });


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


var set_study_area = function(args){
  console.log('global#set_study_area')
  if( args.table )      { table      = args.table }
  if( args.field )      { field      = args.field }
  if( args.geography )  { geography  = args.geography }
  if( args.study_area ) { study_area = args.study_area }

  if (typeof table === 'undefined' || typeof field === 'undefined' || typeof geography === 'undefined'){
    console.log('throw error')
  }

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
}

// private

var get_layer = function(args) {
  console.log('global#get_layer')
  
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
        LegendManager.set_legend({ map: map, field: field, data: data })
        args.add_to.clearLayers()
        args.add_to.addLayer( L.geoJson( data, { style: LegendManager.style } ) )
      }
    , error: function(e) {
        console.log("ERROR")
        console.log(e) } })
}