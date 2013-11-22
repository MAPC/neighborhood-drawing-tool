MapManager.init = function () {
  console.log('MapManager#init')
  tile_layer = {}
  draw_layer = {}
  draw_control = {}

  layers = [ tile_layer, draw_layer, draw_control ]
  _.forEach(layers, function (layer) { layer.addTo(map) })
}

MapManager.set_overlay = function (args) {
  console.log('MapManager#set_overlay')

}


MapManager.apply_study_area = function (study_area) {
  console.log('MapManager#apply_study_area') }
