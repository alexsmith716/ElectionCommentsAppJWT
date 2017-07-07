
var jwt = require('express-jwt')
var customErrorObject = require('./customErrorObject')
var newObjectErrorEnumerable = require('./newObjectErrorEnumerable')

var sendJSONresponse = function(res, status, content) {
  res.status(status)
  res.json(content)
}


// req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'
module.exports.JWTAuthAPI = function (req, res, next) {

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> JWTAuthAPI <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
  /*
  jwt({ 
    secret: process.env.JWT_SECRET, 
    credentialsRequired: true,
  
    getToken: function fromHeaderOrQuerystring (req) {
  
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    }
  })
  */

}


module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ensureAuthenticated > YES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
    next()
  } else {
    res.redirect('/loginorsignup')
  }
}

module.exports.basicAuthAPI = function (req, res, next) {
  var hAuth = req.headers['authorization']
  var expr = /Basic/
  if (hAuth !== undefined && expr.test(hAuth)) {
    next()
  } else {
    var err = newObjectErrorEnumerable( new customErrorObject('Error', 'Unauthorized, missing Basic Auth headers', 401) )
    sendJSONresponse(res, 401, err)
  }
}

module.exports.ensureAuthenticatedNewUserDataItem = function (req, res, next) {

  var u =  req.body.type.charAt(0).toUpperCase()+req.body.type.slice(1)
  var nd = new Date()

  if (req.body.type === 'email' && req.session.userValidatedEmail.isValidated) {

    var dmillis = nd.getTime() - req.session.userValidatedEmail.timeStamp
    dmillis = new Date(dmillis)
    var foo = 'foo'

    // if (foo === 'foo') {
    if (dmillis.getMinutes() > 4) {
    // if (dmillis.getMinutes() > 0) {

      req.session.userValidatedEmail.isValidated = false

      sendJSONresponse(res, 201, { 'response': 'error', 'alertDanger': ' You\'re request to change the '+ u +' has timed out. Please try changing your '+ u +' again.' })

    } else {
      
      next()

    }

  } else if (req.body.type === 'password' && req.session.userValidatedEmail.isValidated && req.session.userValidatedPassword.isValidated) {

    var pmillis = nd.getTime() - req.session.userValidatedPassword.timeStamp
    pmillis = new Date(pmillis)

    // if (foo === 'foo') {
    if (pmillis.getMinutes() > 4) {
    // if (pmillis.getMinutes() > 0) {

      req.session.userValidatedEmail.isValidated = false
      req.session.userValidatedPassword.isValidated = false

      sendJSONresponse(res, 201, { 'response': 'error', 'alertDanger': ' You\'re request to change the '+ u +' has timed out. Please try changing your '+ u +' again.' })

    } else {

      next()

    }
  } else {

    err = customErrorObjectEnumerable( new customErrorObject('Unauthorized, bad credentials, userValidated timeStamp expired', 401) )
    next(err)

  }
}

module.exports.noCache = function (req, res, next) {
  res.header('Cache-Control', 'no-store, no-cache, private, must-revalidate, proxy-revalidate, max-stale=0, post-check=0, pre-check=0')
  //res.header('Expires', '-1')
  //res.header('Pragma', 'no-cache')
  next()
}
