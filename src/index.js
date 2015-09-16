//'use strict'; 


var stockApp = angular.module('stockApp', ['ngRoute']);

  // configure our routes
stockApp.config(function($routeProvider) {
  $routeProvider
    .when('/', {
        templateUrl : 'pages/home.html',
        controller  : 'mainController'
    })
    .when('/add', {
        templateUrl : 'pages/add.html',
        controller  : 'addController'
    })
    .when('/stocks', {
        templateUrl : 'pages/stocks.html',
        controller  : 'stocksController'
    });
});


stockApp.constant('symbolList', []);
stockApp.constant('newlyAdded', []);
stockApp.constant('dataList', []);
stockApp.constant('hasRemove', 0); 

// create the controller and inject Angular's $scope
stockApp.controller('mainController', function($scope) {
    // create a message to display in our view
    $scope.message = 'Lets get started!';
});

stockApp.controller('addController', ['$scope', '$http', 'stockSearch', 'symbolList', 'newlyAdded', 'hasRemove', function($scope, $http, stockSearch, symbolList, newlyAdded, hasRemove) {
  $scope.message = 'Type a symbol or company name.';

  $scope.lookup = function() {
    $scope.results = stockSearch.getStock($scope.stock);
  }
  $scope.list = symbolList;

  $scope.quickAdd = function() {
    var includes = function (array, element){
      for (var i = 0; i < array.length; i++) {
        if (array[i] === element) return true; 
      }
      return false; 
    };
    if (typeof($scope.name)!== 'undefined') {      
    if (!includes(symbolList, $scope.name)) {
      symbolList.push($scope.name);
      newlyAdded.push($scope.name);
      $scope.list = symbolList;
    } else {
      console.log('repeated!'); 
    }
    };
  };

  $scope.remove = function(){
    if (typeof($scope.name)!== 'undefined') {
    for (var i = 0; i < symbolList.length; i++) {
      if (symbolList[i] === $scope.name) {        
        console.log('before',symbolList);
        hasRemove = 1; 
        symbolList.splice(i, 1);
        $scope.list = symbolList;
        console.log('after',symbolList);
        break; 
      }; 
    }
    }
  };


}]);

stockApp.controller('stocksController', function($scope, $http, symbolList, dataList, newlyAdded, hasRemove) {
  $scope.message = 'Here are your stocks:';

  var api = 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=';
  var callback = '&callback=JSON_CALLBACK';
  $scope.list = dataList; 
  var symbols = newlyAdded; 
  console.log('symbols',symbols);
  console.log(hasRemove); 
  if (hasRemove===0) {
    dataList = [];
    for (var i = 0; i < symbolList.length; i++) {
      $http.jsonp(api+symbolList[i]+callback).success(function(data){      
        dataList.push(data);      
        console.log(dataList); 
      });
    }
    hasRemove = 0; 

  } else {
    while(newlyAdded.length > 0){
      $http.jsonp(api+symbols[0]+callback).success(function(data){      
        dataList.push(data);      
        console.log(dataList); 
      });
      newlyAdded.shift(); 

      console.log('dataList',dataList); 
    }
  }
  $scope.list = dataList; 
});
  



//////////////////////////////////////////////////
stockApp.service('stockSearch', function($http){
  this.getStock = function(link) {
    var stocks = [];
    $http.jsonp('http://dev.markitondemand.com/Api/v2/Lookup/jsonp?input='+ link + '&callback=JSON_CALLBACK')
      .success(function(data){
        for (i=0; i<data.length; i++){
          stocks.push({
            name: data[i].Name,
            symb: data[i].Symbol
          });
        }
        console.log(stocks);
      })
      .error( function(error){
        console.log(error);
      });
      return stocks;
    };
  });
