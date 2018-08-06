angular.module('starter.controllers', [])

.controller('welcomeCtrl', function($scope, $stateParams, $ionicHistory, $state) {
	//Build DB if not already there
	var dbRequest = indexedDB.open('userPWA', 1);
	dbRequest.onupgradeneeded = function(e) {
		var thisDB = e.target.result;
		if (!thisDB.objectStoreNames.contains("userInfo")) {
			//CREATE OBJECT STORE userInfo
			thisDB.createObjectStore("userInfo");
			console.log("userInfo Built");
		}
	}
	dbRequest.onerror = function(e) {
		console.log("Error");
	}

	//Login Function
	$scope.loginWelcome = function() {
		//console.log(firebase.auth().currentUser);
		var unsubscribe = firebase.auth().onAuthStateChanged(function(userFB) {
			if (userFB) {
				//USER LOGGED IN
                console.log('User Logged In');
				//ajaxLastLogin(userFB.email);
				iaStatusLogin();
			} else {
				// USER NOT LOGGED IN
				console.log('Not Logged In');
				$state.go('app.login');
			}
		});
		unsubscribe();
	}

	//Check IA Status and then take to HOME or HOME-IA
	function iaStatusLogin() {
		var dbRequest = indexedDB.open('userPWA', 1);
		dbRequest.onsuccess = function(e, params) {
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			var thisDB = e.target.result;
			var transaction = thisDB.transaction(["userInfo"], "readonly");
			var store = transaction.objectStore("userInfo");
			var checkUserInfo = store.get(0);

			checkUserInfo.onsuccess = function(e) {
				if (e.target.result) {
					var email = e.target.result.email;
					var iaInfo = e.target.result.iaInfo;
					var params = {
						user: email
					};
					if (iaInfo == "Added") {
						$state.go('home.home', params);
					} else {
						$state.go('app.homeIA', params);
					}
				} else {
					$state.go('app.login');
				}
			}
			checkUserInfo.onerror = function(e) {
				$state.go('app.login');
			}
		}
	}

    //Send Login App Open INFO
	function ajaxLastLogin(email) {
		//AJAX Request for Last Login Information
		var scriptURL = "https://script.google.com/macros/s/AKfycbwZudWFBVd6k3dtxQMjhY_s4kwiYcPKms-9tjRI9vbcfnFBaFc/exec";
		var request = $.ajax({
			url: scriptURL,
			method: "GET",
            async: true,
			data: {
				"action": "lastLogin",
				"email": email
			},
			dataType: "jsonp",
		});

		console.log(request);
		request.done(function(response, textStatus, jqXHR) {
			console.log(response);
		});
	}
})

.controller('loginCtrl', function($scope, $stateParams, $state, $ionicHistory) {
	$scope.user = {
		email: 'sauravo14@gmail.com',
		password: '12345678'
	};

    //Login Button Click
	$scope.login = function(user) {
		console.log(user);
		var email = user.email;
		var password = user.password;

        //Error Handling    
		if (email.length < 4) {
			alert('Please enter an email address.');
			return;
		}
		if (password.length < 4) {
			alert('Please enter a password.');
			return;
		}

        //Set Persistance Firebase
		firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
			$scope.loginAuth(email, password);
		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			alert(error.message);
		});
	}

    //Actual Login using FB Aith
	$scope.loginAuth = function(email, password) {
		firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            //Error Handling
			var errorCode = error.code;
			var errorMessage = error.message;
			if (errorCode == 'auth/wrong-password') {
				alert('Incorrect Password');
			} else {
				alert('Please check Email Address entered, or try contacting the Admin');
			}
			console.log(error);
		}).then(function() {
            //On Success - Password and Username Match
			console.log('Logged In');
			var unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					console.log(user);
					var email = user.email;
					var params = {
						user: user.email
					};

                    //Sedning LastLogin Info to Google Sheet    
					ajaxLastLogin(email);

					//IDB
					var dbRequest = indexedDB.open('userPWA', 1);
					dbRequest.onsuccess = function(e) {
						console.log("Success!");
						var thisDB = e.target.result;
						var transaction = thisDB.transaction(["userInfo"], "readwrite");
						var store = transaction.objectStore("userInfo");

						var checkUserInfo = store.get(0);

                        //Check userInfo
                        //If pre existing User - Take to Home.IA or Home based on IA Status
						checkUserInfo.onsuccess = function(e) {
							if (e.target.result) {
								var email = e.target.result.email;
								var iaInfo = e.target.result.iaInfo;
								var params = {
									user: email
								};
								if (iaInfo == "Added") {
									$state.go('home.home', params);
								} else {
									$state.go('app.homeIA', params);
								}
							} else {
								var person = {
									email: $scope.user.email,
									iaInfo: ""
								}
								var request = store.add(person, 0);
								request.onerror = function(e) {
									console.log("Error", e.target.error.name);
								}
								request.onsuccess = function(e) {
									console.log("userInfo Added");
									var params = {
										user: $scope.user.email
									};
									$ionicHistory.nextViewOptions({
										disableBack: true
									});
									$state.go('app.homeIA', params);
								}
							}
						}

                        //No user Add New User and take to IA
						checkUserInfo.onerror = function(e) {
							//Not Found - Add the User Info //Define a person
							var person = {
								email: user.email,
								iaInfo: ""
							}
							var request = store.add(person, 0);
							request.onerror = function(e) {
								console.log("Error", e.target.error.name);
							}
							request.onsuccess = function(e) {
				                console.log("userInfo Added");
                                var params = {
                                    user: $scope.user.email
                                };
                                $ionicHistory.nextViewOptions({
                                    disableBack: true
								});
                                $state.go('app.homeIA', params);
							}
						}
					}
					//$state.go('app.homeIA', params);
				}
			});
			unsubscribe();
		});
	};

	function ajaxLastLogin(email) {
		//AJAX Request for Last Login Information
		var scriptURL = "https://script.google.com/macros/s/AKfycbwZudWFBVd6k3dtxQMjhY_s4kwiYcPKms-9tjRI9vbcfnFBaFc/exec";
		var request = $.ajax({
			url: scriptURL,
			method: "GET",
			data: {
				"action": "lastLogin",
				"email": email
			},
			dataType: "jsonp",
		});

		console.log(request);
		request.done(function(response, textStatus, jqXHR) {
			console.log(response);
		});
	}
})
 
.controller('forgotPasswordCtrl', function($scope, $stateParams, $state, $location, $ionicHistory) {
    //$scope.email = $stateParams.email; console.log($scope.email);
    $scope.email = $state.params.email; console.log($scope.email);
    $scope.forgotPassword = function(email) {
      firebase.auth().sendPasswordResetEmail(email).then(function() {
        // Password Reset Email Sent!
        alert('Password Reset Email Sent, you should receive it momentarily');
        $state.go('app.welcome');
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/invalid-email' || errorCode == 'auth/invalid-email') {
          alert('Invalid Email');
        }
        console.log(error);
      }); 
    }
})

.controller('passwordResetCtrl', function($scope, $stateParams, $state, $location, $ionicHistory) {
    //$scope.email = $stateParams.email; console.log($scope.email);
    $scope.query = $location.search(); console.log($scope.query);
    var code = $scope.query.oobCode; console.log(code);
    
    $scope.resetPassword = function(password) {
        if (!password) {
          alert("Please enter valid password");    
            return;  
        }
        var passwordA = password.a;
        var passwordB = password.b;
        if (passwordA != passwordB) {
        alert("Passwords do not match");    
            return;
        }

      firebase.auth().confirmPasswordReset(code,passwordA).then(function() {
        alert('Success - Password has been reset!');
          $ionicHistory.nextViewOptions({
            disableBack: true
            });          
        $state.go('app.login');
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/expired-action-code' || errorCode == 'auth/invalid-action-code') {
          alert('Code Expired - Please try requesting for password again');
        } else if (errorCode == 'auth/user-not-found' ||errorCode == 'auth/user-disabled') {
          alert('Please Contact Admin - Your login is disabled');
        } else if (errorCode == 'auth/weak-password') {
           alert('Weak Password - Please try something stronger'); 
        }
        console.log(error);
        // [END_EXCLUDE]
      });
      // [END sendpasswordemail];        
    }
})

.controller('homeIACtrl', function($scope, $stateParams, $state, $ionicHistory) {
	var email = $stateParams.user;
	console.log(email);
	$scope.user = $state.params.user;
	console.log($scope.user);

		//AJAX Request for Last Login Information
		var scriptURL = "https://script.google.com/macros/s/AKfycbwZudWFBVd6k3dtxQMjhY_s4kwiYcPKms-9tjRI9vbcfnFBaFc/exec";
		var request = $.ajax({
			url: scriptURL,
			method: "GET",
            async: true,
			data: {
				"action": "checkIA",
				"email": email
			},
			dataType: "jsonp",
		});

		console.log(request);
		request.done(function(response, textStatus, jqXHR) {
			console.log(response.result);
            var result = response.result;
            if (result == 'Done') {
                alert("Retrieve Old Data!");
            }
		});
    
	$scope.submitIA = function(ia, callbackOne) {
		//		if (ia == undefined) {
		//			alert('Please make sure that all responses are filled in properly');
		//			return;
		//		}
		//var name = ia.name; console.log(name);
		var dogName = ia.dogName;
		console.log(dogName);
		var age = ia.age;
		console.log(age);
		var breed = ia.breed;
		console.log(breed);
		var gender = ia.gender;
		console.log(gender);
		var neutered = ia.neutered;
		console.log(neutered);
        var minutes = ia.minutes;
        console.log(minutes);
        var seconds = ia.seconds;
        console.log(seconds);
		var duration = (minutes*60) + seconds;
		console.log(duration);
		var date = ia.date;
		console.log(date);
		//		if (name == undefined || dogName == undefined || age == undefined || breed == undefined || gender == undefined || neutered == undefined || minutes == undefined || seconds == undefiend || date == undefined) {
		//			alert('Please make sure that all responses are filled in properly');
		//			return;
		//		}


		//Add IA Info to IDB
		var iaInfo = {
			dogName: ia.dogName,
			age: ia.age,
			breed: ia.breed,
			gender: ia.gender,
			neutered: ia.neutered,
			duration: duration,
			date: ia.date,
			action: "iaInfo",
            email: email
		}


		var idbSupported = false;
		//Support IDB or not
		if (!('indexedDB' in window)) {
			return;
		} else {
			idbSupported = true;
		}

		if (idbSupported) {
			var dbRequest = indexedDB.open('userPWA', 1);
			dbRequest.onsuccess = function(e) {

				var thisDB = e.target.result;
				var transaction = thisDB.transaction(["userInfo"], "readwrite");
				var store = transaction.objectStore("userInfo");

				var checkUserInfo = store.get(0);
				checkUserInfo.onsuccess = function(e) {
					console.log(e.target.result.email);
					var email = e.target.result.email;

					var person = {
						email: email,
						iaInfo: "Added"
					}
					var request = store.put(person, 0);
					request.onerror = function(e) {
						console.log("Error", e.target.error.name);
						//some type of error handler
					}
					request.onsuccess = function(e) {
						console.log("userInfo Updated");
					}

					var request = store.add(iaInfo, 1);
					request.onerror = function(e) {
						console.log("Error", e.target.error.name);
					}
					request.onsuccess = function(e) {
						console.log("IA Info Added");
					}
					//iaInfo.email = email;
					console.log(iaInfo);
					//                    iaInfoToGS();
					//                    toHome(email);
				}
			}
		}
		callbackOne(iaInfo, email);
	}

	$scope.iaInfoToGS = function(iaInfo, email) {
		console.log(iaInfo);
		//AJAX Request for Last Login Information
		var scriptURL = "https://script.google.com/macros/s/AKfycbwZudWFBVd6k3dtxQMjhY_s4kwiYcPKms-9tjRI9vbcfnFBaFc/exec";
		var request = $.ajax({
			url: scriptURL,
			method: "GET",
			data: iaInfo,
			dataType: "jsonp",
		});
		console.log(request);
		request.done(function(response, textStatus, jqXHR) {
			console.log(response);
            //Next Page - Home
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			var params = {
				user: email
			};
			$state.go('home.home', params);
		});
	}
})

.controller('homeCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet) {
	var userTwo = $stateParams.user;
	console.log(userTwo);
	$scope.user = $state.params.user;
	console.log($scope.user);
})

.controller('headerBCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet) {
    
    	//Called when button is clicked
	$scope.showActionSheet = function() {
        var showActionSheet = $ionicActionSheet.show({
         buttons: [
            { text: 'Reset Password' },
            { text: 'Sign Out' }
         ],
			
         //destructiveText: 'Delete',
         titleText: 'Settings',
         cancelText: 'Cancel',
			
         cancel: function() {
            // add cancel code...
         },
			
         buttonClicked: function(index) {
            if(index === 0) {
               $state.go('home.passwordReset');
            }
				
            if(index === 1) {
                firebase.auth().signOut();
                $ionicHistory.nextViewOptions({
						disableBack: true
				});                
                $state.go('app.login');
            }
         },
			
         destructiveButtonClicked: function() {
            // add delete code..
         }
      });
	}
})

.controller('passwordResetFromAppCtrl', function($scope, $stateParams, $state, $location, $ionicHistory) {
	//$scope.email = $stateParams.email; console.log($scope.email);
	//    $scope.query = $location.search(); console.log($scope.query);
	//    var code = $scope.query.oobCode; console.log(code);

	$scope.resetPasswordFromApp = function(password) {
		if (!password) {
			alert("Please enter valid passwords");
			return;
		}
		var passwordA = password.a;
		console.log(passwordA);
		var passwordB = password.b;
		console.log(passwordB);
		var passwordC = password.c;
		console.log(passwordC);

		if (passwordB != passwordC) {
			alert("Passwords do not match");
			return;
		}

		if (passwordA == undefined || passwordB == undefined || passwordC == undefined) {
			alert("Please enter valid passwords");
			return;
		}

        console.log(firebase.auth().currentUser.email);
//		firebase.auth().onAuthStateChanged(function(userFB) {
//			if (userFB) {
        
				var email = firebase.auth().currentUser.email;
                $scope.email = email;
				var credentials = firebase.auth.EmailAuthProvider.credential(
					email,
					passwordA
				);
				firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credentials).then(function() {
					var newPassword = passwordB;
                    console.log("then");
					firebase.auth().currentUser.updatePassword(newPassword).then(function() {
						console.log("Update successful");
                        alert("Password Update successful! Please login with your new Password!");
                        firebase.auth().signOut();
                        $ionicHistory.nextViewOptions({
                                disableBack: true
                        });         
                        $state.go('app.login');                        
					}).catch(function(error) {
						console.log(error);
                        alert("Server Error, please try again later!");
					});
				}).catch(function(error) {
					var errorCode = error.code;
					var errorMessage = error.message;
					if (errorCode == 'auth/wrong-password') {
						alert('Incorrect Password');
					}
					console.log(error);
				});
//			} 
//            else {
//				alert("Please Login again to change your password!");
//                firebase.auth().signOut();
//                $ionicHistory.nextViewOptions({
//						disableBack: true
//				});                 
//				$state.go('app.login');
//			}
//		});
	}
})

.controller('dashboardCtrl', function($scope, $stateParams, $state, $location, $ionicHistory) {
  
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
;
