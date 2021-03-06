/*jslint indent: 2, nomen: true, maxlen: 100, sloppy: true, vars: true, white: true, plusplus: true */
/*global require, exports */

////////////////////////////////////////////////////////////////////////////////
/// @brief User management
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2012 triagens GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Jan Steemann
/// @author Copyright 2012, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

var internal = require("internal"); // OK: time
var arangodb = require("org/arangodb");
var crypto = require("org/arangodb/crypto");
var _ = require("underscore");

var db = arangodb.db;
var ArangoError = arangodb.ArangoError;

// -----------------------------------------------------------------------------
// --SECTION--                                       module "org/arangodb/users"
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// --SECTION--                                                 private functions
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup ArangoShell
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @brief encode password using SHA256
////////////////////////////////////////////////////////////////////////////////

var encodePassword = function (password) {
  var salt;
  var encoded;

  var random = crypto.rand();
  if (random === undefined) {
    random = "time:" + internal.time();
  }
  else {
    random = "random:" + random;
  }

  salt = crypto.sha256(random);
  salt = salt.substr(0,8);

  encoded = "$1$" + salt + "$" + crypto.sha256(salt + password);
   
  return encoded;
};

////////////////////////////////////////////////////////////////////////////////
/// @brief validate a username
////////////////////////////////////////////////////////////////////////////////

var validateName = function (username) {
  if (typeof username !== 'string' || username === '') {
    var err = new ArangoError();
    err.errorNum = arangodb.errors.ERROR_USER_INVALID_NAME.code;
    err.errorMessage = arangodb.errors.ERROR_USER_INVALID_NAME.message;

    throw err;
  }
};

////////////////////////////////////////////////////////////////////////////////
/// @brief validate password
////////////////////////////////////////////////////////////////////////////////

var validatePassword = function (passwd) {
  if (typeof passwd !== 'string') {
    var err = new ArangoError();
    err.errorNum = arangodb.errors.ERROR_USER_INVALID_PASSWORD.code;
    err.errorMessage = arangodb.errors.ERROR_USER_INVALID_PASSWORD.message;

    throw err;
  }
};

////////////////////////////////////////////////////////////////////////////////
/// @brief return the users collection
////////////////////////////////////////////////////////////////////////////////

var getStorage = function () {
  var users = db._collection("_users");

  if (users === null) {
    var err = new ArangoError();
    err.errorNum = arangodb.errors.ERROR_ARANGO_COLLECTION_NOT_FOUND.code;
    err.errorMessage = "collection _users not found";

    throw err;
  }

  return users;
};

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                                  public functions
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup ArangoShell
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @fn JSF_saveUser
/// @brief create a new user
///
/// @FUN{users.save(@FA{user}, @FA{passwd}, @FA{active}, @FA{extra})}
///
/// This will create a new ArangoDB user. The username must be specified in
/// @FA{user} and must not be empty.
///
/// The password must be given as a string, too, but can be left empty if 
/// required.
///
/// If the @FA{active} attribute is not specified, it defaults to @LIT{true}.
/// The @FA{extra} attribute can be used to save custom data with the user.
/// 
/// This method will fail if either the username or the passwords are not
/// specified or given in a wrong format, or there already exists a user with 
/// the specified name.
///
/// The new user account can only be used after the server is either restarted
/// or the server authentication cache is @ref UserManagementReload "reloaded".
///
/// Note: this function will not work from within the web interface
///
/// @EXAMPLES
///
/// @code
/// arangosh> require("org/arangodb/users").save("my-user", "my-secret-password");
/// arangosh> require("org/arangodb/users").reload();
/// @endcode
////////////////////////////////////////////////////////////////////////////////
  
exports.save = function (user, passwd, active, extra) {
  if (passwd === null || passwd === undefined) {
    passwd = "";
  }

  // validate input
  validateName(user);
  validatePassword(passwd);
    
  if (active === undefined || active === null) {
    // this is the default value for active
    active = true;
  }
  
  var users = getStorage();
  var previous = users.firstExample({ user: user });

  if (previous === null) {
    var hash = encodePassword(passwd);
    var data = { 
      user: user,
      password: hash,
      active: active
    };

    if (extra !== undefined) {
      data.extra = extra;
    }

    var doc = users.save(data);
    // not exports.reload() as this is an abstract method...
    require("org/arangodb/users").reload();
    return doc;
  }
    
  var err = new ArangoError();
  err.errorNum = arangodb.errors.ERROR_USER_DUPLICATE.code;
  err.errorMessage = arangodb.errors.ERROR_USER_DUPLICATE.message;

  throw err;
};

////////////////////////////////////////////////////////////////////////////////
/// @fn JSF_replaceUser
/// @brief replace an existing user
///
/// @FUN{users.replace(@FA{user}, @FA{passwd}, @FA{active}, @FA{extra})}
///
/// This will look up an existing ArangoDB user and replace its user data.
///
/// The username must be specified in @FA{user}, and a user with the specified 
/// name must already exist in the database.
///
/// The password must be given as a string, too, but can be left empty if 
/// required.
///
/// If the @FA{active} attribute is not specified, it defaults to @LIT{true}.
/// The @FA{extra} attribute can be used to save custom data with the user.
///
/// This method will fail if either the username or the passwords are not
/// specified or given in a wrong format, or if the specified user cannot be
/// found in the database.
///
/// The replace is effective only after the server is either restarted
/// or the server authentication cache is reloaded (see @ref JSF_reloadUsers).
///
/// Note: this function will not work from within the web interface
///
/// @EXAMPLES
///
/// @code
/// arangosh> require("org/arangodb/users").replace("my-user", "my-changed-password");
/// arangosh> require("org/arangodb/users").reload();
/// @endcode
////////////////////////////////////////////////////////////////////////////////
  
exports.replace = function (user, passwd, active, extra) {
  if (passwd === null || passwd === undefined) {
    passwd = "";
  }

  // validate input
  validateName(user);
  validatePassword(passwd);
  
  if (active === undefined || active === null) {
    // this is the default
    active = true;
  }

  var users = getStorage();
  var previous = users.firstExample({ user: user });

  if (previous === null) {
    var err = new ArangoError();
    err.errorNum = arangodb.errors.ERROR_USER_NOT_FOUND.code;
    err.errorMessage = arangodb.errors.ERROR_USER_NOT_FOUND.message;

    throw err;
  }

  var hash = encodePassword(passwd);
  var data = {
    user: user,
    password: hash,
    active: active
  };
  if (extra !== undefined) {
    data.extra = extra;
  }
  
  var doc = users.replace(previous, data);
    
  // not exports.reload() as this is an abstract method...
  require("org/arangodb/users").reload();
  return doc;
};

////////////////////////////////////////////////////////////////////////////////
/// @fn JSF_updateUser
/// @brief update an existing user
///
/// @FUN{@FA{users}.update(@FA{user}, @FA{passwd}, @FA{active}, @FA{extra})}
///
/// This will update an existing ArangoDB user with a new password and other
/// data.
///
/// The username must be specified in @FA{user} and the user must already exist 
/// in the database.
///
/// The password must be given as a string, too, but can be left empty if 
/// required.
///
/// If the @FA{active} attribute is not specified, the current value saved for
/// the user will not be changed. The same is true for the @FA{extra} attribute.
///
/// This method will fail if either the username or the passwords are not
/// specified or given in a wrong format, or if the specified user cannot be
/// found in the database.
///
/// The update is effective only after the server is either restarted
/// or the server authentication cache is reloaded (see @ref JSF_reloadUsers).
///
/// Note: this function will not work from within the web interface
///
/// @EXAMPLES
///
/// @code
/// arangosh> require("org/arangodb/users").replace("my-user", "my-secret-password");
/// arangosh> require("org/arangodb/users").reload();
/// @endcode
////////////////////////////////////////////////////////////////////////////////

exports.update = function (user, passwd, active, extra) {
  // validate input
  validateName(user);
  if (passwd !== undefined) {
    validatePassword(passwd);
  }

  var users = getStorage();
  var previous = users.firstExample({ user: user });
  
  if (previous === null) {
    var err = new ArangoError();
    err.errorNum = arangodb.errors.ERROR_USER_NOT_FOUND.code;
    err.errorMessage = arangodb.errors.ERROR_USER_NOT_FOUND.message;

    throw err;
  }

  var data = previous._shallowCopy;

  if (passwd !== undefined) {
    var hash = encodePassword(passwd);
    data.password = hash;
  }
  if (active !== undefined && active !== null) {
    data.active = active;
  }
  if (extra !== undefined) {
    data.extra = extra;
  }
  
  var doc = users.update(previous, data);
  
  // not exports.reload() as this is an abstract method...
  require("org/arangodb/users").reload();

  return doc;
};

////////////////////////////////////////////////////////////////////////////////
/// @fn JSF_removeUser
/// @brief delete an existing user
///
/// @FUN{users.remove(@FA{user})}
///
/// Removes an existing ArangoDB user from the database.
///
/// The username must be specified in @FA{user} and the specified user must 
/// exist in the database.
///
/// This method will fail if the user cannot be found in the database.
///
/// The deletion is effective only after the server is either restarted
/// or the server authentication cache is @ref UserManagementReload "reloaded".
///
/// Note: this function will not work from within the web interface
///
/// @EXAMPLES
///
/// @code
/// arangosh> require("org/arangodb/users").remove("my-user");
/// arangosh> require("org/arangodb/users").reload();
/// @endcode
////////////////////////////////////////////////////////////////////////////////
  
exports.remove = function (user) {
  // validate input
  validateName(user);

  var users = getStorage();
  var previous = users.firstExample({ user: user });

  if (previous === null) {
    var err = new ArangoError();
    err.errorNum = arangodb.errors.ERROR_USER_NOT_FOUND.code;
    err.errorMessage = arangodb.errors.ERROR_USER_NOT_FOUND.message;

    throw err;
  }

  var doc = users.remove(previous);

  // not exports.reload() as this is an abstract method...
  require("org/arangodb/users").reload();

  return doc;
};

////////////////////////////////////////////////////////////////////////////////
/// @fn JSF_documentUser
/// @brief get an existing user
///
/// @FUN{users.document(@FA{user})}
///
/// Fetches an existing ArangoDB user from the database.
///
/// The username must be specified in @FA{user}.
/// This method will fail if the user cannot be found in the database.
///
/// Note: this function will not work from within the web interface
////////////////////////////////////////////////////////////////////////////////
  
exports.document = function (user) {
  // validate name
  validateName(user);

  var users = getStorage();
  var previous = users.firstExample({ user: user });
  
  if (previous === null) {
    var err = new ArangoError();
    err.errorNum = arangodb.errors.ERROR_USER_NOT_FOUND.code;
    err.errorMessage = arangodb.errors.ERROR_USER_NOT_FOUND.message;

    throw err;
  }

  return {
    user: previous.user,
    active: previous.active,
    extra: previous.extra || { }
  };
};

////////////////////////////////////////////////////////////////////////////////
/// @fn JSF_allUser
/// @brief gets all existing users
///
/// @FUN{users.all()}
///
/// Fetches all existing ArangoDB users from the database.
////////////////////////////////////////////////////////////////////////////////
  
exports.all = function () {
  var cursor = getStorage().all();
  var result = [ ];
  
  while (cursor.hasNext()) {
    var doc = cursor.next();
    var user = { 
      user: doc.user,
      active: doc.active,
      extra: doc.extra || { }
    };
    result.push(user);
  }

  return result;
};

////////////////////////////////////////////////////////////////////////////////
/// @fn JSF_isValidUsers
/// @brief checks whether a combination of username / password is valid.
///
/// @FUN{users.isvalid(@FA{user}, @FA{password})}
///
/// Checks whether the given combination of username and password is valid.
/// The function will return a boolean value if the combination of username
/// and password is valid.
///
/// Each call to this function is penalized by the server sleeping a random 
/// amount of time.
///
/// Note: this function will not work from within the web interface
////////////////////////////////////////////////////////////////////////////////

exports.isValid = function (user, password) {
  var users = getStorage();
  var previous = users.firstExample({ user: user });
  
  if (previous === null || ! previous.active) {
    return false;
  }

  var salted = previous.password.substr(3, 8) + password;
  var hex = crypto.sha256(salted);

  // penalize the call
  internal.sleep(Math.random());

  return (previous.password.substr(12) === hex);
};

////////////////////////////////////////////////////////////////////////////////
/// @fn JSF_reloadUsers
/// @brief reloads the user authentication data
///
/// @FUN{users.reload()}
///
/// Reloads the user authentication data on the server
///
/// All user authentication data is loaded by the server once on startup only
/// and is cached after that. When users get added or deleted, a cache flush is
/// required, and this can be performed by called this method.
///
/// Note: this function will not work from within the web interface
////////////////////////////////////////////////////////////////////////////////
  
exports.reload = function () {
  throw "cannot use abstract reload function";
};

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                                       END-OF-FILE
// -----------------------------------------------------------------------------

// Local Variables:
// mode: outline-minor
// outline-regexp: "/// @brief\\|/// @addtogroup\\|// --SECTION--\\|/// @page\\|/// @}\\|/\\*jslint"
// End:

