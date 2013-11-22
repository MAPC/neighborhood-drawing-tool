console.log('allo allo')

var QueryManager  = require('./query_manager')
var DataManager   = require('./data_manager')
var SelectManager = require('./select_manager')


DataManager.get_topics( function (topics) {
  $('select#topic').html( SelectManager.generate_options(topics) )
})

DataManager.get_tables('Transportation', function (tables) {
  $('select#table').html( SelectManager.generate_options(tables, {text: 'title', value: 'name'}) )
})

DataManager.get_fields({table: 'means_transportation_to_work_by_residence', callback: function (fields) {
  $('select#field').html( SelectManager.generate_options(fields, {text: 'alias', value: 'field_name'}) )
}})

DataManager.get_geographies({table: 'means_transportation_to_work_by_residence', callback: function (sumlevs) {
  $('select#geography').html( SelectManager.generate_options(sumlevs, {text: 'name', value: 'key'}) )
}})