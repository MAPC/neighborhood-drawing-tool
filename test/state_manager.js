var _    = require('lodash')
  , chai = require("chai")
chai.should()

var S = require('../scripts/state_manager.js')

describe('StateManager', function() {

  // describe('#can_get_extent', function () {
  //   it('returns true when required parameters exist')
  //   it('returns false if any parameter is missing') // beforeEach
  // })

  // describe('#can_get_study_area', function () {
  //   it('returns true when ')
  //   it('returns false when ')
  // })

  describe('#update_params', function () {

    beforeEach(function() {
      S.reset_params()
    })

    it('updates arbitrary parameters', function () {
      var params = {table: 'something', field: 'something_else'}
      S.update_params( params )
      _.isEqual(S.get_params(), params).should.be.true
    })

    it('updates slightly different parameters', function () {
      var params = {geography: 'something', topic: 'something_else'}
      S.update_params( params )
      console.log(S.get_params())
      _.isEqual(S.get_params(), params).should.be.true
    })

    it('only accepts objects')
    
  })
  
})