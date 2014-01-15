var _    = require('lodash')
  , chai = require("chai")

chai.should()

var Q = require('../scripts/query_manager')

describe('QueryManager', function () {
  it('should return the site base URL', function () {
    Q.get_site().should.equal('http://localhost:2474')
  })

  describe('#topics()', function () {
    it('should return an array', function (done) {
      Q.topics( function(data) {
        Object.prototype.toString.call( data ).should.equal('[object Array]')
        done()
      })
    })

    it('should return a non-empty object', function (done) {
      Q.topics( function (data) {
        data.length.should.be.above(0)
        done()
      })
    })

    it('should return an array of objects', function (done) {
      Q.topics( function (data) {
        (typeof data[0]).should.equal('object')  
        done()
      })
    })

    it('objects should have "data", "href", "title", and "value"', function (done) {
      Q.topics( function (data) {
        _.forEach( data, function (topic) { 
          topic.data.should.not.be.undefined
          topic.href.should.not.be.undefined
          topic.data.title.should.not.be.undefined
          topic.data.value.should.not.be.undefined
        })
        done()
      })
    })

    // it('should return a transportation topic', function (done) {
    //   var has_transpo = false
    //   Q.topics( function (data) {
    //     _.forEach( data, function (topic) {
    //       if(topic.title.toLowerCase() === 'transportation') { has_transpo = true }
    //     })
    //     has_transpo.should.be.true
    //     done()
    //   })
    // })

  }) // end #topics()

  describe('#tables()', function (){
    
    // it('should throw an error when given no argument', function () {
    //   // TODO: Verify this worked
    //   chai.expect( function () { Q.tables() } ).to.throw('No topic defined for #tables().')
    // })

    // TODO: beforeEach create a tables variable from
    // the same call to tables() with the same param

    it('should return an array', function (done) {
      Q.tables('housing', function (data) {
        (typeof data).should.equal('object')
        done()
      })
    })

    it('should return a non-empty array', function (done) {
      Q.tables('housing', function (data) {
        data.length.should.be.above(0)
        done()
      })
    })

    it('objects should have "data", "href", "title", and "value"', function (done) {
      Q.tables('housing', function (data) {
        _.forEach(data, function (topic) {
          topic.href.should.not.be.undefined
          topic.data.title.should.not.be.undefined
          topic.data.value.should.not.be.undefined
        })
        done()
      })
    })

    it('should return a rent table when the Housing topic is requested', function (done) {
      // TODO: write a helper to test whether an object is in an array
      Q.tables('housing', function (data) {
        _.forEach( data, function (table) {
          if (table.data.title === 'Gross Rent') {
            table.data.value.should.equal('rent')
            done()
          }
        })
      })
    })

    it('should return a commute table when Transportation is topic', function (done) {
      // TODO: write a helper to test whether an object is in an array
      Q.tables('transportation', function (data) {
        _.forEach( data, function (table) {
          if (table.data.title === 'Travel Time to Work by Residence') { 
            table.data.should.not.be.undefined
            table.data.value.should.equal('travel_time_to_work')
            done()
          }
        })
      })
    })

    it('should return a commute table when Transportation is topic', function (done) {
      // TODO: write a helper to test whether an object is in an array
      Q.tables('TransportatiOn', function (data) {
        _.forEach( data, function (table) {
          if (table.data.title === 'Travel Time to Work by Residence') { 
            table.data.should.not.be.undefined
            table.data.value.should.equal('travel_time_to_work')
            done()
          }
        })
      })
    })

    it('should return an array of objects')
    it('should not return undefined objects')
    it('should return -something- if it cannot get anything from the API')

  })

  describe('#fields', function () {

    it('should throw an error if given no argument')
    it('\'s objects should have "alias" and "field_name"')

  })
})

