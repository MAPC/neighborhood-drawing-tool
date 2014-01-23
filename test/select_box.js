var _    = require('lodash')
  , chai = require('chai')
  , Q    = require('../scripts/query_manager.js')
  , S    = require('../scripts/state_manager.js')
chai.should()

var SelectBox = function () {
  this.element    = ''
  this.path       = ''
  this.listen_to  = ''
  
  var __construct = function (that) {
  }
}

var box


describe('SelectBox', function() {

  describe('box', function() {

    beforeEach(function() {
      box = new SelectBox()
    })

    it('exists', function () {
      box.should.not.be.undefined
    })

    it('should be a function', function () {
      (typeof box).should.equal('object')
    })

    it('should respond to element', function () {
      (box.element).should.not.be.undefined
    })

    it('should respond to listen_to', function () {
      (box.listen_to).should.not.be.undefined
    })

    it('should respond to id')
    it('should respond to function_name')
    it('should append an element to the DOM when constructed')


  })
})