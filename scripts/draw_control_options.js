var draw_control_options = 
{
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
      title 'Draw a rectangular study area.',
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


module.exports = { draw_control_options: draw_control_options }