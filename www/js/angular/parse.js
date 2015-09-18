'use strict';
angular.module('labwiseApp')
  .factory('Parse', ['$resource','$log', '$rootScope', '$window',
    function( $resource, $log, $scope, $window) {


    var sToken = '';
      //get session token when user is updated
      $scope.$on('user:updated', function(e, o) {
        sToken = o.sToken;
      });

      var _getSessionToken = function() {
        return sToken.length ? sToken : null;
      };

    var _reqHeaders = {
        'X-Parse-Application-Id' : 'KQLuPVBYy5fhT5OW4krFPI0HwRfsrlKdiiKszyFv',
        'X-Parse-REST-API-Key' : 'baW2fPrwPkd4M0qkJkwg3MgcKUQnqawYr75O1tif'
    };



      //For IE9 proxy parse request
      var parseBaseURL = 'https://api.parse.com';

      var _parseResource =  $resource(parseBaseURL + '/1/:object/:api', { object: 'functions' }, {
          save: { method : 'POST', headers : _reqHeaders, paramSerializer: '$httpParamSerializerJQLike'},
          query: { method: 'GET', headers: _reqHeaders, paramSerializer: '$httpParamSerializerJQLike'},
          put: { method: 'PUT', headers: _reqHeaders, paramSerializer: '$httpParamSerializerJQLike'}

        });

      var _parseFileResource =  $resource(parseBaseURL + '/1/:object/:api', { object: 'files' }, {
            save: { method : 'POST', headers : _reqHeaders, paramSerializer: '$httpParamSerializerJQLike'}
      });

      var _updatedPayload = function(reqPayload) {
          reqPayload = reqPayload || {};
          //Add default value to the payload

          return reqPayload;
      };

      return {
        save : function(params, reqPayload, success, error) {
          if(!params) {
            $log.debug('Required field params is undefined');
          }
          return _parseResource.save(params, _updatedPayload(reqPayload), success, error);
        },
        query: function(params, reqPayload, success, error) {
          if(!params) {
            $log.debug('Required field params is undefined');
          }
          return _parseResource.query(params, _updatedPayload(reqPayload), success, error);
        },
        put: function(params, reqPayload, success, error) {
          if(!params) {
            $log.debug('Required field params is undefined');
          }
          return _parseResource.put(params, _updatedPayload(reqPayload), success, error);
        },
        upload: function (params, reqPayload, success, error){
          if(!params) {
            $log.debug('Required field params is undefined');
          }
          _reqHeaders['Content-Type'] = reqPayload.type ? reqPayload.type : "image/jpg";
          return _parseFileResource.save(params, _updatedPayload(reqPayload), success, error);

        }


      };



  }]);
