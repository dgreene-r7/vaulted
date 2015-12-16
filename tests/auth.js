require('./helpers').should;

var
  helpers = require('./helpers'),
  debuglog = helpers.debuglog,
  _ = require('lodash'),
  chai = helpers.chai;

chai.use(helpers.cap);


describe('auths', function () {
  var newVault = helpers.getEmptyVault();
  var myVault;

  before(function () {
    return helpers.getReadyVault().then(function (vault) {
      myVault = vault;
    });

  });

  describe('#getAuthMounts', function () {

    it('should reject with an Error if not initialized or unsealed', function () {
      return newVault.getAuthMounts().should.be.rejectedWith(/Vault has not been initialized/);
    });

    it('should update internal state with list of auth mounts', function () {
      var existingAuthMounts = _.cloneDeep(myVault.auths);
      return myVault.getAuthMounts().then(function (auths) {
        debuglog(auths);
        existingAuthMounts.should.be.empty;
        existingAuthMounts.should.not.contain.keys('token/');
        auths.should.not.be.empty;
        auths.should.contain.keys('token/');
      });
    });

  });

  describe('#createAuthMount', function () {

    it('should reject with an Error if not initialized or unsealed', function () {
      return newVault.createAuthMount({
        id: 'other',
        body: {
          type: 'app-id'
        }
      }).should.be.rejectedWith(/Vault has not been initialized/);
    });

    it('should reject with an Error if no options provided', function () {
      return myVault.createAuthMount()
        .should.be.rejectedWith(/You must provide auth mount id/);
    });

    it('should reject with an Error if option id empty', function () {
      return myVault.createAuthMount({
        id: ''
      }).should.be.rejectedWith(/You must provide auth mount id/);
    });

    it('should reject with an Error if option body empty', function () {
      return myVault.createAuthMount({
        id: 'xzy',
        body: null
      }).should.be.rejectedWith(/You must provide auth mount details/);
    });

    it('should reject with an Error if option body without type', function () {
      return myVault.createAuthMount({
        id: 'xzy',
        body: {}
      }).should.be.rejectedWith(/You must provide auth mount type/);
    });

    it('should reject with an Error if option body with empty type', function () {
      return myVault.createAuthMount({
        id: 'xzy',
        body: {
          type: ''
        }
      }).should.be.rejectedWith(/You must provide auth mount type/);
    });

    it('should resolve to updated list of auths', function () {
      var existingAuthMounts = _.cloneDeep(myVault.auths);
      return myVault.createAuthMount({
        id: 'other',
        body: {
          type: 'app-id'
        }
      }).then(function (auths) {
        debuglog(auths);
        existingAuthMounts.should.not.be.empty;
        existingAuthMounts.should.not.contain.keys('other/');
        auths.should.not.be.empty;
        auths.should.contain.keys('other/');
      });
    });

  });


  describe('#deleteAuthMount', function () {

    it('should reject with an Error if not initialized or unsealed', function () {
      return newVault.deleteAuthMount({
        id: 'sample'
      }).should.be.rejectedWith(/Vault has not been initialized/);
    });

    it('should reject if no options provided', function () {
      return myVault.deleteAuthMount()
        .should.be.rejectedWith(/You must provide auth mount id/);
    });

    it('should reject if no option id provided', function () {
      return myVault.deleteAuthMount({
        id: ''
      }).should.be.rejectedWith(/You must provide auth mount id/);
    });

    it('should resolve to updated instance with mount removed', function () {
      var existingAuthMounts = _.cloneDeep(myVault.auths);
      return myVault.deleteAuthMount({
        id: 'other'
      }).then(function (auths) {
        debuglog(auths);
        existingAuthMounts.should.not.be.empty;
        existingAuthMounts.should.contain.keys('other/');
        auths.should.not.be.empty;
        auths.should.not.contain.keys('other/');
        auths.should.contain.keys('token/');
      });
    });

  });

  after(function () {
    if (!myVault.status.sealed) {
      return helpers.resealVault(myVault);
    }
  });

});