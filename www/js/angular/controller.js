labwiseApp.controller('mainController', ['$rootScope','$scope', '$route', '$window','$location', 'userService', 'pushService', function($rootScope, $scope, $route, $window, $location, userService, pushService ){

  pushService.register().then(function(result) {
    console.log('successfully registered for push');
  }, function(err) {
    alert(err);
  });

  var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        sublocality_level_3 : 'short_name', //street
        sublocality_level_1: 'short_name', //area locality
        locality : 'long_name',
        administrative_area_level_1: 'short_name', //state
        administrative_area_level_2: 'short_name', //city
        country: 'long_name',
        postal_code: 'short_name',
        postal_town: 'short_name'
  };

  var onGeoSuccess = function(position) {
      console.log("getting geolocation");
      var lat = parseFloat(position.coords.latitude);
      var lng = parseFloat(position.coords.longitude);
      var latlng = new google.maps.LatLng(lat, lng);
      geocoder = new google.maps.Geocoder();
      geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          //userService.updateUserLocation(formatted_address, results[1].formatted_address);
          //alert(JSON.stringify(results[0]));
          //alert(JSON.stringify(results[1]));
           var reverse_geo = results[0];
           if (reverse_geo.address_components[0]) {
             for (var i = 0; i < reverse_geo.address_components.length; i++) {
               var addressType = reverse_geo.address_components[i].types[0];
               if (componentForm[addressType]) {
                 var val = reverse_geo.address_components[i][componentForm[addressType]];
                 userService.updateUserLocation(addressType, val);
               }
             }
           }
         }

      }
      else {
        alert("Unable to get location info.");
      }
    });
  };

  navigator.geolocation.getCurrentPosition(onGeoSuccess);

  $scope.showWhyWeb = false;

  var u = localStorage.getItem('user');
  var user = u ? JSON.parse(u) : '';
  console.log('user fetched from local stoarge ' + user.isLoggedIn);

  $scope.isUserLoggedIn = false;

  if(user && user.isLoggedIn) {
    console.log("User is logged in..")
    $scope.isUserLoggedIn = true;
    if(user.userType === 'user') {
      $location.path('/user-area');
    } else if (user.userType === 'sp') {
      $location.path('/provider-area');
    }
  }

  $scope.openSite = function () {
    $window.open('http://labwise.in', '_blank');
  };

  $scope.whyWeb = function () {
    $scope.showWhyWeb = true;
  }

  $scope.gotitWeb = function () {
    $scope.showWhyWeb = false;

  }

  $scope.whyLogin = function () {
    $scope.showWhyLogin = true;
  }

  $scope.gotitLogin = function () {
    $scope.showWhyLogin = false;

  }

  $scope.whyRegister = function () {
    $scope.showWhyRegister = true;
  }

  $scope.gotitRegister = function () {
    $scope.showWhyRegister = false;

  }

}]);

labwiseApp.controller('registerController', ['$rootScope','$scope', '$location', '$route', '$window','userService',
  function($rootScope, $scope, $location, $route, $window, userService){


  var user = userService.getUser();
  if(user.isLoggedIn) {

      console.log("already logged in..");
      if(user.userType === 'user') {
        $location.path('/user-area');
      } else if(user.userType === 'sp') {
        $location.path('/provider-area');
      }
    }

  $scope.chooseTrue = true;
  $scope.providerView = false;
  $scope.providerView2 = false;
  $scope.userView = false;

  $scope.word = '/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/';

  $scope.providerSelected = function () {
    var userlocation = userService.getUserLocation();
    console.log(userlocation);
    $scope.city = userlocation.locality ? userlocation.locality : '' ;
    $scope.area = userlocation.sublocality_level_1 ? userlocation.sublocality_level_1 : '';
    $scope.pincode = userlocation.postal_code ? userlocation.postal_code : '';

    $scope.providerView = true;
    $scope.chooseTrue = false;
  };

  $scope.userSelected = function () {
    var userlocation = userService.getUserLocation();
    console.log(userlocation);
    $scope.city = userlocation.locality ? userlocation.locality : '' ;
    $scope.area = userlocation.sublocality_level_1 ? userlocation.sublocality_level_1 : '';
    $scope.pincode = userlocation.postal_code ? userlocation.postal_code : '';

    $scope.providerView = false;
    $scope.chooseTrue = false;
    $scope.userView = true;
  };

  $scope.submitProvideFormView1 = function() {

    if(! ($scope.lab || $scope.nurse || $scope.rmp || $scope.physio || $scope.food) ) {
      alert('Please select at least one service');
      return;
    }

    if(!($scope.city && $scope.area && $scope.pincode) ) {
      alert('Please fill all details');
      return;
    }

    $scope.chooseTrue = false;
    $scope.providerView = false;
    $scope.providerView2 = true;
    console.log('provider view 2' + $scope.providerView2);
    return;

  };

  $scope.savingUser = false;
  $scope.saveProvider = function () {


    console.log($scope.pname  + '&&' + $scope.email  + ' &&' + $scope.mobile  + '&&' +  $scope.passwd);

    var regex = /^1?([2-9]\d\d){2}\d{4}$/,
    regexReplace = /\D/g,
    EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    if(!($scope.pname && $scope.email && $scope.mobile && $scope.passwd)) {
      alert('Please enter details');
      return;
    }

    var email = $scope.email;
    if((email.length === 0) || !EMAIL_REGEXP.test(email)) {
      alert('Please enter a valid email');
      return;
    }
    var mobile = $scope.mobile;
    mobile = mobile.replace(regexReplace, '');
    if((mobile.length !== 10) || !regex.test(mobile)) {
      alert('Please enter a valid 10 digit mobile');
      return;
    }

    $scope.savingUser = true;

    var payload = {};
    payload.email = email;
    payload.mobile = mobile;
    payload.username = $scope.pname;
    payload.passwd = $scope.passwd;
    payload.services = [];
    $scope.lab ? payload.services.push('LAB') : '';
    $scope.rmp ? payload.services.push( 'RMP') : '';
    $scope.nurse ? payload.services.push('NURSE') : '';
    $scope.physio ? payload.services.push('PHYSIO') : '';
    $scope.food ? payload.services.push( 'FOOD' ) : '';
    $scope.pharmacy ? payload.services.push( 'PHARMACY' ) : '';
    payload.city = $scope.city;
    payload.area = $scope.area;
    payload.pincode = $scope.pincode;
    payload.userType = 'sp';

    console.log(payload);

    $scope.lPromise = userService.signup(payload);

    $scope.lPromise.then(function(u) {
        //success callback
        console.log('After signup ' + JSON.stringify(u));
        //save to localstorage
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('installation', 'complete');
        $location.path('/provider-area');
      }, function(r) {
          //error callback
        console.log('Signup failed ' + JSON.stringify(r));
        alert('Unable to Signup :' + r.msg);
        $scope.errMsg = r.msg;
        //on failure reset the captcha widget as it can't be re-used

      }, function(s) {
        $scope.lMessage = s;
      }).finally(function() {
        //google recaptcha causes input element
        //in IE not to display any updated text.
        //setting focus() seems to fix this issue

      });

  }

  $scope.saveUser = function () {

    console.log($scope.name  + '&&' + $scope.email  + ' &&' + $scope.mobile  + '&&' +  $scope.passwd);
    var regex = /^1?([2-9]\d\d){2}\d{4}$/,
    regexReplace = /\D/g,
    EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    if(!($scope.name && $scope.email && $scope.mobile && $scope.passwd)) {
      alert('Please enter details');
      return;
    }

    var email = $scope.email;
    if((email.length === 0) || !EMAIL_REGEXP.test(email)) {
      alert('Please enter a valid email');
      return;
    }
    var mobile = $scope.mobile;
    mobile = mobile.replace(regexReplace, '');
    if((mobile.length !== 10) || !regex.test(mobile)) {
      alert('Please enter a valid 10 digit mobile');
      return;
    }

    $scope.savingUser = true;

    var payload = {};
    payload.email = email;
    payload.mobile = mobile;
    payload.username = $scope.name;
    payload.passwd = $scope.passwd;
    payload.userType = 'user';
    payload.city = $scope.city;
    payload.area = $scope.area;
    payload.pincode = $scope.pincode;


    console.log(payload);

    $scope.lPromise = userService.signup(payload);

    $scope.lPromise.then(function(u) {
        //success callback
        console.log('After signup ' + JSON.stringify(u));

        $location.path('/user-area');
      }, function(r) {
          //error callback
        console.log('Signup failed ' + JSON.stringify(r));
        alert('Unable to Signup :' + r.msg);
        $scope.errMsg = r.msg;
        //on failure reset the captcha widget as it can't be re-used

      }, function(s) {
        $scope.lMessage = s;
      }).finally(function() {
        //google recaptcha causes input element
        //in IE not to display any updated text.
        //setting focus() seems to fix this issue

      });

  }

}]);


labwiseApp.controller('loginController', ['$scope', '$location', '$route', '$window','userService',
  function($scope, $location, $route, $window, userService){

  var user = userService.getUser();
  if(user.isLoggedIn) {

    //console.log("already logged in..");
    if(user.userType === 'user') {
      $location.path('/user-area');
    } else if(user.userType === 'sp') {
      $location.path('/provider-area');
    }
  }

  $scope.logon = function () {

    var regex = /^1?([2-9]\d\d){2}\d{4}$/,
    regexReplace = /\D/g,
    EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    if(!($scope.login && $scope.passwd)) {
      alert('Please enter details');
      return;
    }

    var login = $scope.login;
    if((login.length === 0) || !(EMAIL_REGEXP.test(login) || regex.test(login))) {
      alert('Please enter a valid email or 10 digit mobile');
      return;
    }

    $scope.loggingIn = true;
    $scope.lPromise = userService.login(login, $scope.passwd);

    $scope.lPromise.then(function(u) {
        //success callback
        localStorage.setItem('user', JSON.stringify(u));
        console.log('After login ' + JSON.stringify(u));
        $scope.loggingIn = true;

        if(u.userType === 'user') {
          $location.path('/user-area');
        } else if(u.userType === 'sp') {
          $location.path('/provider-area');
        }
      //$location.path('/user-area');
      }, function(r) {
          //error callback
        console.log('Login failed ' + JSON.stringify(r));
        alert('Login Failed : ' + r.msg);
        //$scope.errMsg = r.msg;
        //on failure reset the captcha widget as it can't be re-used

      }, function(s) {
        $scope.lMessage = s;
      }).finally(function() {

      });
  }

}]);


labwiseApp.controller('providerController',['$scope', '$location', '$route', '$window','userService',
  function($scope, $location, $route, $window, userService){


  $scope.sos = [];
  var u = localStorage.getItem('user');
  var user = u ? JSON.parse(u) : '';

  if(user && user.isLoggedIn) {
    $scope.isLoggedIn = true;
  } else {
    $scope.isLoggedIn = false;
  }

  $scope.city = user.city ? user.city: userService.getUserCity();
  $scope.pincode = user.pincode ? user.pincode: userService.getUserPincode();;
  $scope.area = user.area  ? user.area: userService.getUserArea();


  $scope.showOrderDetailsTrue = false;
  $scope.proceed = function () {
    $window.open('http://labwise.in', '_blank');
  }

  $scope.viewOrders = false;
  $scope.fetchingOrders = false;

  $scope.showViewOrdersForm = function () {
    $scope.fetchingOrders = true;
    $scope.viewOrders = true;

    $scope.lpromise = userService.getSpOrders(user.oID);

    $scope.lpromise.then(function (data) {

      $scope.fetchingOrders = false;
      //$scope.sos = userService.getSpOrderList();
      data.sos.forEach(function(so) {
        //console.log('getSpOrder response ' + JSON.stringify(so));
        $scope.sos.push(so);
      });
      //console.log('orders fetched ' + $scope.sos);

    }, function (err){
      console.log('Unable fetch orders')
    },function(s) {
      $scope.lMessage = s;
    }).finally(function() {
    });

    $scope.fetchingOrders = true;
  }
  $scope.showOrderDetails = function (soid) {
    //console.log(soid);
    $scope.showOrderDetailsTrue = true;
    $scope.sso = $scope.sos[soid];
    return;
  }
  $scope.backToOrdersMenu = function () {
      $scope.showOrderDetailsTrue = false;
      return;
  }
  $scope.backToMainMenu = function () {
      $scope.viewOrders = false;
      $scope.showOrderDetailsTrue = false;
      return;
  }

  $scope.completeOrder = function () {
    $scope.orderCompleteConfirm = true;
    return;
  }

  $scope.completeOrderConfirm = function (soid) {
    alert("Order status has been updated");
    $scope.orderCompleteConfirm = false;
    return;
  }
  $scope.completeOrderCancel = function (soid) {
    $scope.orderCompleteConfirm = false;
    return;
  }

}]);


labwiseApp.controller('userController', ['$scope', '$route', '$window', 'userService', function($scope, $route, $window, userService){


  $scope.service_list = [
    {id:1, name:'LAB'},
    {id:2, name:'PHARMACY'},
    {id:3, name:'RMP'},
    {id:4, name:'NURSE'},
    {id:5, name:'PHYSIO'},
    {id:6, name:'Hi-FOOD'}
  ];

  //init labtests listening
  $scope.labTestList = userService.getLABTestList();

  var u = localStorage.getItem('user');
  var user = u ? JSON.parse(u) : '';

  $scope.service_name = $scope.service_list[2];

  if(user && user.isLoggedIn) {
    $scope.isLoggedIn = true;
  } else {
    $scope.isLoggedIn = false;
  }

  $scope.city = user.city ? user.city: userService.getUserCity();
  $scope.pincode = user.pincode ? user.pincode : userService.getUserPincode();
  $scope.area = user.area  ? user.area: userService.getUserArea();
  console.log(userService.getUserLocation());
  $scope.quickBook = false;
  $scope.getHiBits = false;
  $scope.labServiceSelected = false;
  $scope.pharmacyServiceSelected = false;
  $scope.isUpdateUserAddress = false;

  $scope.quickBookForm = function() {
    $scope.quickBook = true;
    $scope.labServiceSelected = false;

    if($scope.labTestList.length == 0) {
      $scope.labTestList = userService.getLABTestList();
    }
    console.log($scope.labTestList);
    return;
  }

  $scope.proceed = function () {
    $window.open('http://labwise.in', '_blank');
  }

  $scope.updateMyAddress = function () {
    $scope.isUpdateUserAddress = true;
    console.log('update address:' + $scope.isUpdateUserAddress );
    return;
  }

  $scope.updateAddress = function () {
    console.log($scope.address);
    console.log($scope.pincode);
    $scope.isUpdateUserAddress = false;
    return;
  }

  $scope.cancelUpdateAddress = function () {
    $scope.isUpdateUserAddress = false;
    return;
  }

  $scope.serviceSelected = function (value) {
    console.log(value);
    if(value.name == "LAB") {
      $scope.labServiceSelected = true;
      $scope.pharmacyServiceSelected = false;
    } else if (value.name == "PHARMACY") {
      $scope.labServiceSelected = false;
      $scope.pharmacyServiceSelected = true;

    } else {
      $scope.labServiceSelected = false;
      $scope.pharmacyServiceSelected = false;
    }

    return;
  }

  $scope.upload = function(el) {
    $scope.prescription_file = el.files[0];
    console.log($scope.prescription_file);
    var imageRegex = "image/(jpg|jpeg|png|bmp|gif)";
    //var regex = /^1?([2-9]\d\d){2}\d{4}$/,
    var fileTypeRegex = "application/(pdf)";
    var ImageFileSizeKB = 1024;

    if ($scope.prescription_file.type.length && !(new RegExp(imageRegex).test($scope.prescription_file.type)) && !(new RegExp(fileTypeRegex).test($scope.prescription_file.type))) {
       console.log('Invalid file type ' + $scope.prescription_file.type);
       alert("Invalid file type " + $scope.prescription_file.type +". Please upload a valid image file type (.jpg, .png, .bmp, .pdf)");

       return true;
     }

     var fileSize = Math.round(parseInt($scope.prescription_file.size));
     if(fileSize > (5120*1024)) {
       console.log('File size is above limit ' + $scope.prescription_file.size);
       alert("File size ids too large.Please upload 1 MB or less");
       return true;
     }



  };


  $scope.upload_bill = function(el) {


    $scope.bill_file = el.files[0];
    console.log($scope.bill_file);

    var imageRegex = "image/(jpg|jpeg|png|bmp|gif)";
    //var regex = /^1?([2-9]\d\d){2}\d{4}$/,
    var fileTypeRegex = "application/(pdf)";
    var ImageFileSizeKB = 1024;

    if (!(new RegExp(imageRegex).test($scope.bill_file.type)) && !(new RegExp(fileTypeRegex).test($scope.bill_file.type))) {
       console.log('Invalid file type ' + $scope.bill_file.type);
       alert("Invalid file type. Please upload a valid image file type (.jpg, .png, .bmp, .pdf)");

       return true;
     }

     var fileSize = Math.round(parseInt($scope.bill_file.size));
     if(fileSize > (5120*1024)) {
       console.log('File size is above limit ' + $scope.bill_file.size);
       alert("File size ids too large.Please upload 1 MB or less");
       return true;
     }

  };

  $scope.submitQuickBook = function() {

    var orderInfo = [];
    if($scope.service_name.name == 'PHARMACY' ) {
      if($scope.prescription_text == undefined && $scope.prescription_file == undefined) {
        alert('Please upload presscription or enter medicine name.');
        return;
      }
      var pharamacy = {};
      pharamacy.prescription_text = $scope.prescription_text ? $scope.prescription_text:'';
      orderInfo.push({"pharmacy":pharamacy});
    } else if($scope.service_name.name == 'LAB' ) {
      if($scope.lab_test == undefined) {
        alert('Please enter test name.');
        return;
      }
      var lab = {};
      lab.lab_test = $scope.lab_test ? $scope.lab_test : '';
      orderInfo.push({"lab":lab});
    }
    //create the order
    var contactInfo = {};
    contactInfo.address = $scope.address ? $scope.address : (user.area + '' + user.city);
    contactInfo.pincode = $scope.pincode ? $scope.pincode : user.pincode;
    contactInfo.mobile =  $scope.mobile ? $scope.mobile : user.mobile;
    contactInfo.email = user.email;
    orderInfo.push({"contactInfo":contactInfo});

    console.log($scope.service_name.name + ' ' + user.oID + ' ' + JSON.stringify(orderInfo) );
    $scope.lPromise  = userService.createOrder($scope.service_name.name, user.oID, orderInfo);
    $scope.lPromise.then(function(o) {

        console.log('After createOrder ' + JSON.stringify(o));
        if($scope.prescription_file) {

          $scope.lPromise = userService.uploadFile($scope.prescription_file);
          $scope.lPromise.then(function(url) {
              var serviceOrder = o.ServiceOrder;
              serviceOrder.orderInfo[0].pharmacy.file_url = url;
              console.log("updating order " + serviceOrder.objectId)
              $scope.lPromise = userService.updateOrder(serviceOrder.objectId, serviceOrder.orderInfo);
              $scope.lPromise.then(function(url) {
              }, function(r) {
                console.log('order update failed ' + JSON.stringify(r));
              },function(s) {
              }).finally(function() {
              });
              console.log('File url ' + JSON.stringify(url));
            }, function(r) {
              console.log('upload  failed ' + JSON.stringify(r));
              alert('upload Failed : ' + r.msg);
            }, function(s) {
              $scope.lMessage = s;
            }).finally(function() {
            });
        }
        alert('You request has been submitted!');
        $scope.quickBook = false;

      }, function(r) {

        console.log('createOrder failed ' + JSON.stringify(r));
        alert('createOrder Failed : ' + r.msg);
      }, function(s) {
        $scope.lMessage = s;

      }).finally(function() {
      });
  }

  $scope.showHiBitsForm = function(){
    $scope.getHiBits = true;
    return;
  }

  $scope.submitHiBitsForm = function () {

    var orderInfo = [];
    var hibits = {};
    hibits.amount = $scope.amount;
    orderInfo.push({"hibits":hibits});

    console.log($scope.service_name.name + ' ' + user.oID + ' ' + JSON.stringify(orderInfo) );
    $scope.lPromise  = userService.createOrder($scope.service_name.name, user.oID, orderInfo, 'hibits');
    $scope.lPromise.then(function(o) {
      if($scope.bill_file) {
          $scope.lPromise = userService.uploadFile($scope.bill_file);
          $scope.lPromise.then(function(url) {
              var serviceOrder = o.ServiceOrder;
              serviceOrder.orderInfo[0].hibits.file_url = url;
              console.log("updating order " + serviceOrder.objectId)
              $scope.lPromise = userService.updateOrder(serviceOrder.objectId, serviceOrder.orderInfo);
              $scope.lPromise.then(function(url) {

              }, function(r) {
              },function(s) {
              }).finally(function() {
              });

            }, function(r) {
              alert('upload Failed : ' + r.msg);
            }, function(s) {
              $scope.lMessage = s;
            }).finally(function() {
            });
        }
        alert('You request has been submitted ');
        $scope.getHiBits = false;
      }, function(r) {
        alert('createOrder Failed : ' + r.msg);
      }, function(s) {
        $scope.lMessage = s;
      }).finally(function() {
      });

    return;
  }

}]);
