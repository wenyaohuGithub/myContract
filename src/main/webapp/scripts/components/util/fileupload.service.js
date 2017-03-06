'use strict';

angular.module('mycontractApp')
    .factory('FileUpload', function ($resource, $window, $http) {
    var _params = {};
    var factory = {
        query: function () {
            return $resource('api/fileupload/', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            })
        },
        upload: function(){
            return $resource('api/fileupload', {}, {
                'uploadFile': {
                    method: 'Post',
                    transformRequest: angular.identity,
                    params: _params,
                    headers: {'Content-type': undefined},
                    transformResponse: function (data) {
                        data = angular.fromJson(data);
                        return data;
                    }
                }
            });
        },
        download: function(){
            return $resource('api/fileupload/:id', {}, {
                'downloadFile': {
                    method: 'GET',
                    responseType: 'arraybuffer',
                    transformResponse: function (result) {
                        var file = new Blob([result], {type: 'application/pdf'});
                        var fileURL = window.URL.createObjectURL(file);
                        var fileObj = {file : fileURL};
                        return fileObj;
                    }
                }
            });
        },

        setParameter: function(parameters){
            _params = parameters;
        }
    };
    return {
        query: factory.query,
        upload: factory.upload,
        download: factory.download,
        setParameter: factory.setParameter
    }
});
