'use strict';

angular.module('mycontractApp')
    .service('UrlParams', function () {
      this.parseParam = function(params){
            var urlParamString = '';
            angular.forEach(params, function(paramInfo, urlParam){
                if(urlParamString == ''){
                    urlParamString = urlParamString+'?'+urlParam+'='+paramInfo;
                } else {
                    urlParamString = urlParamString+'&'+urlParam+'='+paramInfo;
                }
            });
            return urlParamString;
        };
    });
