var _    = require('lodash')
  , chai = require("chai")
chai.should()

var S = require('../scripts/state_manager.js')

describe('StateManager', function() {

  describe ('required', function () {

    it('returns required parameters', function () {
      S.get_requirements().should.not.be.undefined
    })

    it('has required parameters', function () {
      reqs = ['table', 'topic', 'field', 'geography', 'map']
      _.forEach(reqs, function (req) {
        S.get_requirements().indexOf(req).should.not.equal(-1)
      })
    })

    it('cannot change requirements', function() {
      S.required = []
      S.get_requirements().length.should.be.above(0)
    })
  })

  // describe('#map_added')

  describe('#can_get_extent', function () {

    beforeEach(function() {
      S.reset_params()
    })

    it('returns true when required parameters exist', function () {
      S.update_params({
          table:     'mock-table'
        , topic:     'mock-topic'
        , field:     'mock-field'
        , map:       'mock-map'
        , geography: 'mock-geography'
      })
      S.can_get_extent().should.be.true
    })

    it('returns false if any parameter is missing', function () {
      var reqs = S.get_requirements()
      _.forEach(reqs, function (req) {
        var set = _.clone(reqs)
        _.pull(set, req)
        _.forEach(set, function (el) {
          S.update_params({el: true})
        })
        S.can_get_extent().should.be.false
      })
    })

    it('throws if there are no requirements', function () {
      S.clear_requirements()
      chai.expect( function () { 
        S.can_get_extent() 
      }).to.throw('StateManager has no requirements.')
    })
  })

  // describe('#drawing_added')
  // describe('#can_get_study_area')

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
      _.isEqual(S.get_params(), params).should.be.true
    })

    it('accepts an array of objects', function () {
      var params = [{geography: 'which'}, {topic: 'another'}]
        , expected = _.merge(params[0], params[1])
      S.update_params( params )
      _.isEqual(S.get_params(), expected).should.be.true
    })
  })

  
})