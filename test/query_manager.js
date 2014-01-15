var _    = require('lodash')
  , chai = require("chai")

chai.should()

var Q = require('../scripts/query_manager')

describe('QueryManager', function () {
  it('should return the site base URL', function () {
    Q.get_site().should.equal('http://localhost:2474')
  })

  describe('#topics()', function(){
    it('should return an array', function () {
      var type = Object.prototype.toString.call( Q.topics() )
      type.should.equal( '[object Array]' )
    })

    it('should return a non-empty object', function () {
      Q.topics().length.should.be.above(0)
    })

    it('should return an array of objects', function () {
      (typeof Q.topics()[0]).should.equal('object')
    })

    it('should return objects with keys "title" and "value"', function () {
      _.forEach( Q.topics(), function (topic) { 
        topic.title.should.not.be.undefined
        topic.value.should.not.be.undefined
      })
    })

    it('should return a transportation topic', function () {
      var has_transpo = false
      _.forEach( Q.topics(), function (topic) {
        if(topic.title === 'Transportation') { has_transpo = true }
      })
      has_transpo.should.be.true
    })
  }) // end #topics()

  describe('#tables()', function (){
    
    it('should throw an error when given no argument', function () {
      // TODO: Verify this worked
      chai.expect( function () { Q.tables() } ).to.throw('No topic defined for #tables().')
    })

    // TODO: beforeEach create a tables variable from
    // the same call to tables() with the same param

    it('should return an array', function () {
      var type = Object.prototype.toString.call( Q.tables('dummy_param') )
      type.should.equal( '[object Array]' )
    })

    it('should return a non-empty array', function() {
      Q.tables('param').length.should.be.above(0)
    })

    it('should return an array of objects', function () {
      (typeof Q.tables('anything')[0]).should.equal('object')
    })

    it('should return objects with keys "title" and "value"', function () {
      _.forEach( Q.tables('what-have-you'), function (topic) { 
        topic.title.should.not.be.undefined
        topic.value.should.not.be.undefined
      })
    })

    it('should return a rent table when the Housing topic is requested', function () {
      // TODO: write a helper to test whether an object is in an array
      var the_table
      _.forEach(Q.tables('housing'), function (table) {
        if (table.title === 'Gross Rent') { the_table = table }
      })
      the_table.value.should.equal('rent')
    })

    it('should return a commute table when Transportation is topic', function () {
      var the_table
      _.forEach(Q.tables('transportation'), function (table) {
        if (table.title === 'Travel Time to Work by Residence') { 
          the_table = table }
      })
      the_table.should.not.be.undefined
      the_table.value.should.equal('travel_time_to_work')
    })

    it('should search for tables case-insensitive', function () {
      var the_table
      _.forEach(Q.tables('TransportatiOn'), function (table) {
        if (table.title === 'Travel Time to Work by Residence') { 
          the_table = table }
      })
      the_table.should.not.be.undefined
      the_table.value.should.equal('travel_time_to_work')
    })

    it('should return -something- if it cannot get anything from the API')
  })
})

