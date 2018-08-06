angular.module('starter.controllers', [])

.controller('welcomeCtrl', function($scope, $stateParams, $ionicHistory, $state, $ionicPopup) {
	//Build DB if not already there
	var dbRequest = indexedDB.open('userPWA', 2);
	dbRequest.onupgradeneeded = function(e) {
		var thisDB = e.target.result;
		if (!thisDB.objectStoreNames.contains("userInfo")) {
			//CREATE OBJECT STORE userInfo
			thisDB.createObjectStore("userInfo");
			console.log("userInfo Built");
		}
		if (!thisDB.objectStoreNames.contains("sessionInfo")) {
			thisDB.createObjectStore("sessionInfo",{keyPath: "id", autoIncrement:true});
			console.log("Session Info Built");
		}
		if (!thisDB.objectStoreNames.contains("plansInfo")) {
			thisDB.createObjectStore("plansInfo",{keyPath: "id", autoIncrement:true});
			console.log("Plans Info Built");
		}
		if (!thisDB.objectStoreNames.contains("plansNotes")) {
			thisDB.createObjectStore("plansNotes",{keyPath: "id", autoIncrement:true});
			console.log("Plans Notes Built");
		}
		if (!thisDB.objectStoreNames.contains("customDuration")) {
			thisDB.createObjectStore("customDuration",{keyPath: "id", autoIncrement:true});
			console.log("Custom Duration DB Built");
		}        
	}
    
	dbRequest.onerror = function(e) {
		console.log(e);
	}    

	//Login Function
	$scope.loginWelcome = function() {
		//console.log(firebase.auth().currentUser);
		var unsubscribe = firebase.auth().onAuthStateChanged(function(userFB) {
			if (userFB) {
				//USER LOGGED IN
                console.log('User Logged In');
				ajaxLastLogin(userFB.email);
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
		var dbRequest = indexedDB.open('userPWA', 2);
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
						$state.go('tabs.home', params);
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
    
    
    $scope.clearDB = function() {
        var dbRequest = indexedDB.deleteDatabase("userPWA");
        dbRequest.onsuccess = function(e) {
            console.log("DB Cleared");  
            //alert("Database has been cleared. Your Page will now refresh!");
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Database has been cleared. Your Page will now refresh!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                
            });
            location.reload();
        }
    }
    
})

.controller('loginCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicLoading, $ionicPopup) {
	$scope.user = {
		email: 'sauravo14@gmail.com',
		password: '12345678'
	};

    //Login Button Click
	$scope.login = function(user) {
        // Setup the loader
        $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
        });
        
		console.log(user);
		var email = user.email;
		var password = user.password;

        //Error Handling    
		if (email.length < 4) {
			//alert('Please enter an email address.');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please enter an Email Address!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
			return;
		}
		if (password.length < 4) {
			//alert('Please enter a password.');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please enter a Password!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
			return;
		}

        //Set Persistance Firebase
		firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
			$scope.loginAuth(email, password);
		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
            console.log(error.message);
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please try again after some time!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
            $ionicLoading.hide();
		});
	}

    //Actual Login using FB Auth
	$scope.loginAuth = function(email, password) {
		firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            //Error Handling
			var errorCode = error.code;
			var errorMessage = error.message;
			if (errorCode == 'auth/wrong-password') {
				//alert('Incorrect Password');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Incorrect Password!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });                
			} else {
				//alert('Please check Email Address entered, or try contacting the Admin');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please check the Email Address entered, or try contacting the Admin!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });                
			}
			console.log(error);
            $ionicLoading.hide();
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
					var dbRequest = indexedDB.open('userPWA', 2);
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
									$state.go('tabs.home', params);
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
 
.controller('forgotPasswordCtrl', function($scope, $stateParams, $state, $location, $ionicHistory, $ionicPopup) {
    //$scope.email = $stateParams.email; console.log($scope.email);
    $scope.email = $state.params.email; console.log($scope.email);
    $scope.forgotPassword = function(email) {
      firebase.auth().sendPasswordResetEmail(email).then(function() {
        // Password Reset Email Sent!
        //alert('Password Reset Email Sent, you should receive it momentarily');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Password Reset Email has been sent, you should receive it momentarily!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });          
        $state.go('app.welcome');
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/invalid-email' || errorCode == 'auth/user-not-found') {
          //alert('Invalid Email');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Inavlid Email Address entered!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
        }
        console.log(error);
      }); 
    }
})

.controller('passwordResetCtrl', function($scope, $stateParams, $state, $location, $ionicHistory, $ionicPopup) {
    //$scope.email = $stateParams.email; console.log($scope.email);
    $scope.query = $location.search(); console.log($scope.query);
    var code = $scope.query.oobCode; console.log(code);
    
    $scope.resetPassword = function(password) {
        if (!password) {
          //alert("Please enter valid password");    
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please enter a valid Password!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
            return;  
        }
        var passwordA = password.a;
        var passwordB = password.b;
        if (passwordA != passwordB) {
        //alert("Passwords do not match");    
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Passwords do not match!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
            return;
        }

      firebase.auth().confirmPasswordReset(code,passwordA).then(function() {
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Success - Password has been reset!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });          
        //alert('Success - Password has been reset!');
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
          //alert('Code Expired - Please try requesting for password again');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Code Expired - Please try requesting again!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
        } else if (errorCode == 'auth/user-not-found' ||errorCode == 'auth/user-disabled') {
          //alert('Please Contact Admin - Your login is disabled');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please Contact Admin - Your login is disabled!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
        } else if (errorCode == 'auth/weak-password') {
           //alert('Weak Password - Please try something stronger'); 
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Weak Password - Please try something stronger!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
        }
        console.log(error);
        // [END_EXCLUDE]
      });
      // [END sendpasswordemail];        
    }
})

.controller('homeIACtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicLoading, $ionicPopup) {
    $ionicLoading.hide();

    var email = $stateParams.user;
    console.log(email);
    $scope.user = $state.params.user;
    console.log($scope.user);

    //AJAX Request for Checking Initial Assessment
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
    		//alert("Retrieve Old Data!");

    		$scope.showConfirm = function() {
    			var confirmPopup = $ionicPopup.show({
    				title: 'Alert',
    				template: 'Looks like you have used our App before. Would you like to retrieve Old Data?',
    				buttons: [{
    					text: '<b>YES</b>',
    					type: 'button-assertive',
    					onTap: function(e) {
    						return 'Yes'
    					}
    				}, {
    					text: '<b>NO</b>',
    					type: 'button-energized',
    					onTap: function(e) {
    						return 'No'
    					}
    				}]
    			});

    			confirmPopup.then(function(res) {
    				console.log(res);
    				if (res == "Yes") {
    					console.log('Yes Pressed');
                        //Retrieve Data
                        retrieveData(email);
    				} else {
    					console.log('No Pressed');
    					//Do Nothing
    				}
    			});
    		};
    		$scope.showConfirm();
    	}
    });
	//AJAX Request for Checking Initial Assessment  

    function retrieveData(email) {
        $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
        });
        
        var emailAlt = email.replace(/[^a-zA-Z0-9]/g, '');
        console.log(emailAlt);
        
        //User Info
        var ref = firebase.database().ref('User Info/' + emailAlt);
        ref.once("value", function(snapshot) {
            var allUserInfo = snapshot.val()['allUserInfo'];
            console.log(allUserInfo);
            $scope.allUserInfo = allUserInfo;

            var dbRequest = indexedDB.open('userPWA', 2);
            dbRequest.onsuccess = function(e) {
                var thisDB = e.target.result;
                var transaction = thisDB.transaction(["userInfo"], "readwrite");
                var store = transaction.objectStore("userInfo");

                store.put(allUserInfo[0],0);
                store.put(allUserInfo[1],1);    
                store.put(allUserInfo[2],2);
                store.put(allUserInfo[3],3);
                store.put(allUserInfo[4],4);
                store.put(allUserInfo[5],5);
                store.put(allUserInfo[6],6);
            }
        }, function(error) {
            console.log("Error: " + error.code);
        });
        
        //Cue Lists
        var ref = firebase.database().ref('Cue Lists/' + emailAlt);
        ref.once("value", function(snapshot) {
            var fullCueList = snapshot.val()['thisUserCueList'];
            console.log(fullCueList);
            $scope.fullCueList = fullCueList;

            var dbRequest = indexedDB.open('userPWA', 2);
            dbRequest.onsuccess = function(e) {
                var thisDB = e.target.result;
                var transaction = thisDB.transaction(["userInfo"], "readwrite");
                var store = transaction.objectStore("userInfo");

                store.put(fullCueList,2);
            }
        }, function(error) {
            console.log("Error: " + error.code);
        });
        
        //Sessions Info
        var ref = firebase.database().ref('User Sessions/' + emailAlt);
        ref.once("value", function(snapshot) {
            var allSessionsData = snapshot.val()['allSessionsData'];
            console.log(allSessionsData);
            $scope.allSessionsData = allSessionsData;

            var dbRequest = indexedDB.open('userPWA', 2);
            dbRequest.onsuccess = function(e) {
                var thisDB = e.target.result;
                var transaction = thisDB.transaction(["sessionInfo"], "readwrite");
                var store = transaction.objectStore("sessionInfo");

            for (var x in $scope.allSessionsData) {
                if ($scope.allSessionsData.hasOwnProperty(x)) {
                    store.put($scope.allSessionsData[x]);
                }
            }
                
            }
        }, function(error) {
            console.log("Error: " + error.code);
        });        
        
        //Plans Info One
        var ref = firebase.database().ref('Plans Info One/' + emailAlt);
        ref.once("value", function(snapshot) {
            var allPlansData = snapshot.val()['allPlansData'];
            console.log(allPlansData);
            $scope.allPlansData = allPlansData;

            var dbRequest = indexedDB.open('userPWA', 2);
            dbRequest.onsuccess = function(e) {
                var thisDB = e.target.result;
                var transaction = thisDB.transaction(["plansInfo"], "readwrite");
                var store = transaction.objectStore("plansInfo");

            for (var x in $scope.allPlansData) {
                if ($scope.allPlansData.hasOwnProperty(x)) {
                    store.put($scope.allPlansData[x]);
                }
            }
                
            }
        }, function(error) {
            console.log("Error: " + error.code);
        }); 
        
        //Plans Notes Two
        var ref = firebase.database().ref('Plans Notes Two/' + emailAlt);
        ref.once("value", function(snapshot) {
            var allPlansNotes = snapshot.val()['allPlansNotes'];
            console.log(allPlansNotes);
            $scope.allPlansNotes = allPlansNotes;

            var dbRequest = indexedDB.open('userPWA', 2);
            dbRequest.onsuccess = function(e) {
                var thisDB = e.target.result;
                var transaction = thisDB.transaction(["plansNotes"], "readwrite");
                var store = transaction.objectStore("plansNotes");

            for (var x in $scope.allPlansNotes) {
                if ($scope.allPlansNotes.hasOwnProperty(x)) {
                    store.put($scope.allPlansNotes[x]);
                }
            }   
            }
        }, function(error) {
            console.log("Error: " + error.code);
        });         
        
        $scope.iaInfoToGS();
    }
    
	//GET ORIGINAL CUE LIST DATA FROM FB and STORE IN IDB
	var ref = firebase.database().ref('Original Cue List');
	ref.once("value", function(snapshot) {
		var originalCueList = snapshot.val()['theOriginalCueList'];
		console.log(originalCueList);
		$scope.originalCueList = originalCueList;

		var dbRequest = indexedDB.open('userPWA', 2);
		dbRequest.onsuccess = function(e) {
			var thisDB = e.target.result;
			var transaction = thisDB.transaction(["userInfo"], "readwrite");
			var store = transaction.objectStore("userInfo");

			var checkUserInfo = store.get(0);
			checkUserInfo.onsuccess = function(e) {
				var request = store.add(originalCueList, 2);
				request.onerror = function(e) {
					console.log("Error", e.target.error.name);
					console.log('Error in Saving Cue List Info');
				}
				request.onsuccess = function(e) {
					console.log('Cue Lists Saved Info');
				}
			}
		}
	}, function(error) {
		console.log("Error: " + error.code);
		var originalCueList = "";
	});
    
	//GET PLANS MASTER FROM FB and STORE IN IDB
	var ref = firebase.database().ref('Plans Master');
	ref.once("value", function(snapshot) {
		var plansMaster = snapshot.val();
		console.log(snapshot.val());
		$scope.plansMaster = plansMaster;

		var dbRequest = indexedDB.open('userPWA', 2);
		dbRequest.onsuccess = function(e) {
			var thisDB = e.target.result;
			var transaction = thisDB.transaction(["userInfo"], "readwrite");
			var store = transaction.objectStore("userInfo");

			var checkUserInfo = store.get(0);
			checkUserInfo.onsuccess = function(e) {
				var request = store.add(plansMaster, 3);
				request.onerror = function(e) {
					console.log("Error", e.target.error.name);
					console.log('Error in Saving Plans Master List Info');
				}
				request.onsuccess = function(e) {
					console.log('Plans Master Saved!');
				}
			}
		}
	}, function(error) {
		console.log("Error: " + error.code);
		var originalCueList = "";
	});    

	//SUBMIT IA
	$scope.submitIA = function(ia, callbackOne) {
        
        if (ia == undefined) {
            //alert('Please make sure that all responses are filled in properly');
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please make sure that all responses are filled in properly!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
            return;
        }
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
		var duration = (minutes * 60) + seconds;
		console.log(duration);
		var date = ia.date;
		console.log(date);
        
				if (name == undefined || dogName == undefined || age == undefined || breed == undefined || gender == undefined || neutered == undefined || minutes == undefined || seconds == undefined || date == undefined) {
					//alert('Please make sure that all responses are filled in properly');
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Please make sure that all responses are filled in properly!',
                        buttons: [
                          {
                            text: '<b>OK</b>',
                            type: 'button-assertive',
                          }
                        ]                          
                    });                    
					return;
				}


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

        $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
        });
        
		var idbSupported = false;
		//Support IDB or not
		if (!('indexedDB' in window)) {
			return;
		} else {
			idbSupported = true;
		}

		if (idbSupported) {
			var dbRequest = indexedDB.open('userPWA', 2);
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
        emailAlt = email.replace(/[^a-zA-Z0-9]/g, '');
        firebase.database().ref('IA/'+emailAlt).set({iaInfo});
		callbackOne(iaInfo, email);
	}

	//Callback Function being Used - To Send Info to Google Sheet
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
            $state.go('tabs.home', params);
		});
	}
})

.controller('tabsCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $ionicLoading, $ionicPopup) {
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
               $state.go('app.passwordResetFromApp');
            }
				
            if(index === 1) {
                firebase.auth().signOut();
                $ionicHistory.nextViewOptions({
						disableBack: true
				});                
                $state.go('app.welcome');
            }
         },
			
         destructiveButtonClicked: function() {
            // add delete code..
         }
      });
	}
})

.controller('homeCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $ionicLoading, $ionicPopup) {
    if (firebase.auth().currentUser) {
        var email = firebase.auth().currentUser.email;
        console.log(email);         
        var ref = firebase.database().ref('users');
        ref.once("value", function(snapshot) {
            var allUsers = snapshot.val();
            console.log(allUsers);
            for (i = 0; i < allUsers.length; i++) {
                var thisEmail = allUsers[i]["email"];
                var thisStatus = allUsers[i]["status"];
                console.log(thisEmail);
                if (email == thisEmail) {
                    console.log(thisStatus);
                    if (thisStatus == "Disabled") {
                         firebase.auth().signOut();
                            $ionicHistory.nextViewOptions({
                                    disableBack: true
                            });         
                            $state.go('app.login');
                            $ionicPopup.alert({
                                        title: 'Alert',
                                        template: 'Please Contact the Admin!',
                                        buttons: [
                                          {
                                            text: '<b>OK</b>',
                                            type: 'button-assertive',
                                          }
                                        ]                                  
                            });                      
                    }
                    break;
                }
            }
        }, function(error) {
            console.log("Error: " + error.code);
        });        
    }
    
//    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
//    $scope.series = ['Series A', 'Series B'];
//    $scope.data = [
//        [65, 59, 80, 81, 56, 55, 40],
//        [28, 48, 40, 19, 86, 27, 90]
//    ];
//    
//    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
//    $scope.series = ['Series A'];
//    $scope.data = [
//        [65, 59, 80, 81, 56, 55, 40]
//    ];
//    
    $scope.labels = ["Struggled", "Okay", "Aced It"];
    $scope.series = ['Dog Do'];
    $scope.data = [
        [0, 0, 0]
    ];
    
    // Setup the loader
    $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
    });
    
    //TIMES
    var nowTime = new Date().getTime();
    console.log(nowTime);
    var sevenDays = nowTime - (7*24*60*60*1000);
    var thirtyDays = nowTime - (30*24*60*60*1000);
    
    //STEPS & DURATION
    var totalSteps = 0;
    var totalDuration = 0;
    
    //IDB START
    var dbRequest = indexedDB.open('userPWA', 2); 
    
    dbRequest.onsuccess = function(e) {
        //PLAN DETAILS - LAST PLAN/DURATION COMPLETED INFO
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(4);//
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);
            var planDetails = e.target.result;
            if (planDetails != undefined) {
                $scope.showDash = true;
            } else {
                $scope.showDash = false;
            }
            $scope.planDetails = planDetails;              
   	    }                
            
        //PLANS INFO - All USER SESSIONS COMPLETED
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["plansInfo"], "readonly");
   	    var store = transaction.objectStore("plansInfo");
        var request = store.getAll();
        request.onsuccess = function(e) {
            console.log(e.target.result);
            var plansInfo = e.target.result;
            $scope.plansInfo = plansInfo;
            
            //DASH 4 INITIAL
            for (var x in $scope.plansInfo) {
                if ($scope.plansInfo.hasOwnProperty(x)) {
                    var thisPlan = $scope.plansInfo[x];
                    for (var z in thisPlan) {
                        if (thisPlan[z]["duration"]) {
                            totalSteps ++;
                            var thisDuration = thisPlan[z]["duration"];
                            totalDuration += thisDuration;
                        }                        
                    }
                }
            }
            console.log([totalSteps,totalDuration]);
   	    }
        
        //PLANS NOTES - FORM AFTER SESSION
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["plansNotes"], "readonly");
   	    var store = transaction.objectStore("plansNotes");
        var request = store.getAll();
        request.onsuccess = function(e) {
            console.log(e.target.result);
            var plansNotes = e.target.result;
            $scope.plansNotes = plansNotes;
            
            //COUNT EXERCISES
            var lastSeven = 0;
            var lastThirty = 0;
            var totalSessions = 0;
            
            //DATA FOR CHART INITIAL
            var data = [];
            data[0] = [0,0,0];
            
            //FIRST EXERCISE DURATION COUNT
            var firstExerciseDurationCount = 0;
            
            for (var x in $scope.plansNotes) {
                if ($scope.plansNotes.hasOwnProperty(x)) {
                    //DASH 1
                    var date = $scope.plansNotes[x]["date"];
                    var time = $scope.plansNotes[x]["dateGetTime"];
                    //var time = date.getTime();
                    if (time > sevenDays) {
                        lastSeven++;
                    }
                    if (time > thirtyDays) {
                        lastThirty ++;
                    }
                    totalSessions++;
                }
                
                //DASH 2
                if (firstExerciseDurationCount < 1) {
                    var firstExerciseDuration = $scope.plansNotes[x]["thisExerciseDuration"];
                    var lastExerciseDuration = $scope.plansNotes[x]["thisExerciseDuration"];   
                    firstExerciseDurationCount ++;
                } else {
                    var lastExerciseDuration = $scope.plansNotes[x]["thisExerciseDuration"];   
                }
                
                //DASH 4 FINAL
                var comfDuration = $scope.plansNotes[x]["comfDuration"];
                var actualDuration = $scope.plansNotes[x]["actualDuration"];
                
                if (actualDuration != comfDuration) {
                    totalDuration = totalDuration - actualDuration + comfDuration;
                }
                
                //DASH 3
                var dogDo = $scope.plansNotes[x]["dogDo"];
                if (dogDo == 1) {
                    data[0][0]++;
                }
                if (dogDo == 2) {
                    data[0][1]++;
                }
                if (dogDo == 3) {
                    data[0][2]++;
                } 
            }
            
            console.log([firstExerciseDuration,lastExerciseDuration]);
            console.log([lastSeven,lastThirty,totalSessions]);
            console.log([totalSteps,totalDuration]);
            totalDuration = moment.utc(moment.duration(totalDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
            console.log([totalSteps,totalDuration]);
            console.log(data);
            
            //FINAL SCOPING
            
            $scope.lastSeven = lastSeven;
            $scope.lastThirty = lastThirty;
            $scope.totalSessions = totalSessions;
            
            $scope.firstDuration = firstExerciseDuration;
            $scope.lastDuration = lastExerciseDuration;
            
            $scope.totalSteps = totalSteps;
            $scope.totalDuration = totalDuration;
            
            $scope.labels = ["Struggled", "Okay", "Aced It"];
            $scope.series = ['Dog Do'];
            $scope.data = data;
            
            //IONIC LOADING HIDE
            console.log("IDB END");
            $ionicLoading.hide();
   	    }  
   	}
})

.controller('plansCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $ionicScrollDelegate, $ionicLoading, $ionicPopup) {
    $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
    });
    
    var dbRequest = indexedDB.open('userPWA', 2); 
    
    dbRequest.onsuccess = function(e) {
        //PLAN DETAILS - LAST PLAN/DURATION COMPLETED INFO
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(4);//
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);//
            var planDetails = e.target.result;
            $scope.planDetails = planDetails;              
   	    }                
            
        //PLANS INFO - All USER SESSIONS COMPLETED
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["plansInfo"], "readonly");
   	    var store = transaction.objectStore("plansInfo");
        var request = store.getAll();
        request.onsuccess = function(e) {
            console.log(e.target.result);
            var plansInfo = e.target.result;
            $scope.plansInfo = plansInfo;
            var plansInfoCount = 0;
            for (var i in $scope.plansInfo) {
                if ($scope.plansInfo.hasOwnProperty(i)) {
                    plansInfoCount ++;
                } 
            }
            $scope.plansInfoCount = plansInfoCount;
   	    }
        
        //PLANS NOTES - FORM AFTER SESSION
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["plansNotes"], "readonly");
   	    var store = transaction.objectStore("plansNotes");
        var request = store.getAll();
        request.onsuccess = function(e) {
            console.log(e.target.result);
            var plansNotes = e.target.result;
            $scope.plansNotes = plansNotes;
            var plansNotesCount = 0;
            for (var i in $scope.plansNotes) {
                if ($scope.plansNotes.hasOwnProperty(i)) {
                    plansNotesCount ++;
                } 
            }
            $scope.plansNotesCount = plansNotesCount;
            if ($scope.plansInfoCount > $scope.plansNotesCount) {
                console.log("something is off");
                
                var transaction = thisDB.transaction(["userInfo"], "readonly");
                var store = transaction.objectStore("userInfo");

                var request = store.get(6);
                    request.onerror = function(e) {
                        console.log("Error", e.target.error.name);
                    }
                    request.onsuccess = function(e) {
                        console.log(e.target.result)
                        if (e.target.result == "Regular") {
                        $ionicHistory.nextViewOptions({
                                disableBack: true
                        });                             
                            $state.go('tabs.plansExerciseNewNotes');          
                        } else {
                        $ionicHistory.nextViewOptions({
                                disableBack: true
                        });                             
                            $state.go('tabs.plansExerciseNewNotesCustom');          
                        }
                    }
            }            
         $ionicLoading.hide();   
   	    }        
   	}
    
    dbRequest.onerror = function(e) {
        $ionicLoading.hide();
    }    

    /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
    $ionicScrollDelegate.resize();
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
    
})

.controller('plansExerciseHomeCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $interval, $ionicModal, $ionicLoading, $ionicPopup) {
    $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
    });
    //$scope.timeInitial = 0;

    //CUSTOM DURATION BUTTON CLICK
    $scope.customDuration = function(custom) {
        console.log(custom);
        if (custom != undefined && custom.checked == true) {
            if (custom.hours == undefined || custom.minutes == undefined || custom.seconds == undefined) {
                console.log(1);
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Please make sure that Custom Duration is filled in properly!',
                        buttons: [
                          {
                            text: '<b>OK</b>',
                            type: 'button-assertive',
                          }
                        ]                          
                    });                
				return;                
            }
            console.log(custom.checked);
            var hours = custom.hours;
            var secsInHours = hours * 60 * 60;
            var minutes = custom.minutes;
            var seconds = custom.seconds;
            var customSecs = (minutes * 60) + seconds + secsInHours;
            console.log(customSecs);
            
            if (hours == null || minutes == null || seconds == null) {
                //alert('Please make sure that Custom Duration is filled in properly');
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Please make sure that Custom Duration is filled in properly!',
                        buttons: [
                          {
                            text: '<b>OK</b>',
                            type: 'button-assertive',
                          }
                        ]                          
                    });                
				return;                
            }
            
            if (customSecs > 5400) {
                customSecs = 5400;
            }
            
            for (var x in $scope.plansMaster) {
                if ($scope.plansMaster.hasOwnProperty(x)) {
                    var thisDuration = $scope.plansMaster[x]["secs"];
                    if (thisDuration > customSecs) {
                        //THIS LEVEL / SPLIT
                        $scope.thisExercise = $scope.plansMaster[x];//
                        var thisExerciseFormatted = {};
                        for (var z in $scope.thisExercise) {
                          if ($scope.thisExercise.hasOwnProperty(z)) {
                              if ($scope.thisExercise[z]["secs"]) {
                                  //var secs = Math.round($scope.thisExercise[z]["mult"] * customSecs);
                                  var secs = Math.ceil($scope.thisExercise[z]["mult"] * customSecs / 5) * 5;
                                  var thisStep = $scope.thisExercise[z]["step"];
                                  var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                thisExerciseFormatted[z] = {};
                                  thisExerciseFormatted[z]["secs"] = thisSecs;
                                  thisExerciseFormatted[z]["step"] = thisStep;
                                  thisExerciseFormatted[z]["comments"] = "";
                                  thisExerciseFormatted[z]["duration"] = secs;
                              }
                          }  
                        }
                        thisExerciseFormatted["duration"] = moment.utc(moment.duration(customSecs,"seconds").asMilliseconds()).format("HH:mm:ss");
                        thisExerciseFormatted["actualDuration"] = customSecs;
                        $scope.thisExerciseFormatted = thisExerciseFormatted;
                        console.log(thisExerciseFormatted);
                        break;
                    }
                } 
            }
         //ADD TO IDB   
            var dbRequest = indexedDB.open('userPWA', 2); 
            dbRequest.onsuccess = function(e) {
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readwrite");
   	    var store = transaction.objectStore("userInfo");            
            var request = store.put(thisExerciseFormatted, 5);
				request.onerror = function(e) {
                    console.log("Error", e.target.error.name);    
					}
					request.onsuccess = function(e) {
						console.log("Custom Duration Updated");
					}                
            } 
            $state.go('tabs.plansExerciseNewCustom');
        } else {
            console.log(2);
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Please make sure that Custom Duration is filled in properly!',
                        buttons: [
                          {
                            text: '<b>OK</b>',
                            type: 'button-assertive',
                          }
                        ]                          
                    });                
				return;             
        }
    }
    
    //IDB
    var dbRequest = indexedDB.open('userPWA', 2); 

    //CHECK LAST PLAN/DURATION COMPLETED INFO
    //IF BLANK - GET INITIAL DURATION
        //IF GETTING INITIAL DURATION - GIVE NEXT DURATION
    //
    
    dbRequest.onsuccess = function(e) {
        //PLAN DETAILS - LAST PLAN/DURATION COMPLETED INFO
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(4);//
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);//
            var planDetails = e.target.result;
            $scope.planDetails = planDetails;              
   	    }
        
        //PLANS MASTER - Levels and Splits
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(3);
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);
            var plansMaster = e.target.result;
            $scope.plansMaster = plansMaster; 
   	    }        
        
        //INITIAL DURATION
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(1);
        checkUserInfo.onsuccess = function(e) {
            var initialDuration = e.target.result["duration"];
            $scope.initialDuration = initialDuration;   
            console.log(initialDuration);
            
            if ($scope.planDetails == undefined) {  //IF BLANK - GET INITIAL DURATION
            //INITIAL DURATION becomes LAST DURATION
                $scope.showLastActual = false;
                for (var x in $scope.plansMaster) {
                if ($scope.plansMaster.hasOwnProperty(x)) {
                    var thisDuration = $scope.plansMaster[x]["secs"];
                    var thisSplitLevel = $scope.plansMaster[x]["splitLevel"];
                    var thisKey = $scope.plansMaster[x]["key"];
                    if (thisDuration > initialDuration) {
                        //THIS LEVEL
                        //Math.ceil(x/5)*5
                        initialDuration = Math.ceil(initialDuration/5)*5;
                        nextDuration = Math.ceil(nextDuration/5)*5;
                        var lastDuration = moment.utc(moment.duration(initialDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.lastDuration = lastDuration;
                        var nextDuration = moment.utc(moment.duration(thisDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.nextDuration = nextDuration;
                        $scope.showText = "BASED ON YOUR INITIAL ASSESSMENT";
                        $scope.thisExercise = $scope.plansMaster[x];//
                        $scope.splitLevel = thisSplitLevel;////////////
                        console.log($scope.splitLevel);
                        var thisExerciseFormatted = {};
                        for (var z in $scope.thisExercise) {
                          if ($scope.thisExercise.hasOwnProperty(z)) {
                              if ($scope.thisExercise[z]["secs"]) {
                                  var secs = Math.round($scope.thisExercise[z]["secs"]);
                                  var thisStep = $scope.thisExercise[z]["step"];
                                  var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                    thisExerciseFormatted[z] = {};
                                  thisExerciseFormatted[z]["secs"] = thisSecs;
                                  thisExerciseFormatted[z]["step"] = thisStep;
                                  thisExerciseFormatted[z]["comments"] = "";
                              }
                          }  
                        }
                        $scope.thisExerciseFormatted = thisExerciseFormatted;
                        console.log(thisExerciseFormatted);
                        break;
                        var showLastActual = false;
                    }
                } 
            } 
            }  else {
                $scope.showLastActual = true;
                console.log($scope.planDetails);
                //Plan Details Exists
                //GET LAST DURATION
                //NEXT DURATION
                var lastDuration = $scope.planDetails["lastDuration"];
                var lastActualDuration = $scope.planDetails["lastActualDuration"];
                var nextStage = $scope.planDetails["nextStage"];                  
                $scope.lastDuration = lastDuration;
                $scope.lastActualDuration = lastActualDuration;
                for (var x in $scope.plansMaster) {
                if ($scope.plansMaster.hasOwnProperty(x)) {
                    var thisDuration = $scope.plansMaster[x]["secs"]; // SECS
                    var thisStage = $scope.plansMaster[x]["stage"]; //STAGE
                    var thisSplitLevel = $scope.plansMaster[x]["splitLevel"];
                    if (thisStage == nextStage) {
                        var foundStage = 0;
                        thisDuration = Math.ceil(thisDuration/5)*5;
                        var nextDuration = moment.utc(moment.duration(thisDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.nextDuration = nextDuration;     
                        $scope.splitLevel = thisSplitLevel;////////////
                        console.log($scope.splitLevel);
                        $scope.thisExercise = $scope.plansMaster[x];//
                        var thisExerciseFormatted = {};
                        for (var z in $scope.thisExercise) {
                          if ($scope.thisExercise.hasOwnProperty(z)) {
                              if ($scope.thisExercise[z]["secs"]) {
                                  var secs = Math.round($scope.thisExercise[z]["secs"]);
                                  var thisStep = $scope.thisExercise[z]["step"];
                                  var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                    thisExerciseFormatted[z] = {};
                                  thisExerciseFormatted[z]["secs"] = thisSecs;
                                  thisExerciseFormatted[z]["step"] = thisStep;
                                  thisExerciseFormatted[z]["comments"] = "";
                              }
                          }  
                        }
                        $scope.thisExerciseFormatted = thisExerciseFormatted;
                        console.log(thisExerciseFormatted);
                        break;                        
                    }
                    }
                }
                if (!foundStage) {
                    console.log("here");
                    nextStage = 59;
                    for (var x in $scope.plansMaster) {
                    if ($scope.plansMaster.hasOwnProperty(x)) {
                        var thisDuration = $scope.plansMaster[x]["secs"]; // SECS
                        var thisStage = $scope.plansMaster[x]["stage"]; //STAGE
                        var thisSplitLevel = $scope.plansMaster[x]["splitLevel"];
                        if (thisStage == nextStage) {
                            var foundStage = 0;
                            thisDuration = Math.ceil(thisDuration/5)*5;
                            var nextDuration = moment.utc(moment.duration(thisDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                            $scope.nextDuration = nextDuration;     
                            $scope.splitLevel = thisSplitLevel;////////////
                            console.log($scope.splitLevel);
                            $scope.thisExercise = $scope.plansMaster[x];//
                            var thisExerciseFormatted = {};
                            for (var z in $scope.thisExercise) {
                              if ($scope.thisExercise.hasOwnProperty(z)) {
                                  if ($scope.thisExercise[z]["secs"]) {
                                      var secs = Math.round($scope.thisExercise[z]["secs"]);
                                      var thisStep = $scope.thisExercise[z]["step"];
                                      var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                        thisExerciseFormatted[z] = {};
                                      thisExerciseFormatted[z]["secs"] = thisSecs;
                                      thisExerciseFormatted[z]["step"] = thisStep;
                                      thisExerciseFormatted[z]["comments"] = "";
                                  }
                              }  
                            }
                            $scope.thisExerciseFormatted = thisExerciseFormatted;
                            console.log(thisExerciseFormatted);
                            break;                        
                        }
                        }
                    }                    
                }                
            }
   	    }
        $ionicLoading.hide();
   	}
})

.controller('plansExerciseNewCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $interval, $ionicModal, $ionicLoading, $ionicPopup) {
   	//STEP 1
    //$scope.timeInitial = 0;
    
    $scope.submitPlan = function(thisExerciseFormattedFinal) {
        //ADD TO FB and PLANS INFO
        var email = firebase.auth().currentUser.email;
        email = email.replace(/[^a-zA-Z0-9]/g, '');
        
        var dbRequest = indexedDB.open('userPWA', 2); 
        
        dbRequest.onsuccess = function(e) {
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["plansInfo"], "readwrite");
   	    var store = transaction.objectStore("plansInfo");
        
        var request = store.add(thisExerciseFormattedFinal);
					request.onerror = function(e) {
						console.log("Error", e.target.error.name);
					}
					request.onsuccess = function(e) {
						console.log("Plans Step 1 Info Added to IDB");
					}
                
                    var requestAll = store.getAll();
					requestAll.onerror = function(e) {
						console.log("Error", e.target.error.name);
					}
					requestAll.onsuccess = function(e) {
						console.log(e);
                        var allPlansData = e.target.result;
                        firebase.database().ref('Plans Info One/'+email).update({allPlansData});
					}
                    
        var transaction = thisDB.transaction(["userInfo"], "readwrite");
   	    var store = transaction.objectStore("userInfo");
            
        var request = store.put("Regular", 6);
            request.onerror = function(e) {
                console.log("Error", e.target.error.name);
            }
            request.onsuccess = function(e) {
                console.log("Data Added Store 6");
            }
            
            $state.go('tabs.plansExerciseNewNotes');
        }
    }
    
    //STEP 2
    $scope.saveExercise = function(exercise, next) {
	var dogDo = exercise.dogDo;
	console.log(dogDo);

	if (exercise.checked == undefined) {
		//alert('Please fill in all Queries');
		$ionicPopup.alert({
			title: 'Alert',
			template: 'Please fill in all Queries',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]              
		});
		return;
	}

	if (exercise.checked == 'No') {
		//DOG DID NOT MEET DURATION - GET HH MM SS
		console.log(next);

		if (next == undefined) {
			$ionicPopup.alert({
				title: 'Alert',
				template: 'Please enter a duration your dog was comfortable with!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
			});
			//alert('Please enter a duration your dog was comfortable with!');
			return;
		}
		if (next.hours == undefined || next.minutes == undefined || next.seconds == undefined) {
			$ionicPopup.alert({
				title: 'Alert',
				template: 'Please enter a duration your dog was comfortable with!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
			});
			//alert('Please enter a duration your dog was comfortable with!');
			return;
		}

		var hours = next.hours;
		var secsInHours = hours * 60 * 60;
		var minutes = next.minutes;
		var seconds = next.seconds;
		var customSecs = (minutes * 60) + seconds + secsInHours;
		console.log(customSecs);

		if (customSecs > 5400) {
			customSecs = 5400;
		}

		exercise["comfDuration"] = customSecs;

		var lastActualDuration = moment.utc(moment.duration(customSecs, "seconds").asMilliseconds()).format("HH:mm:ss");

		for (var x in $scope.plansMaster) {
			if ($scope.plansMaster.hasOwnProperty(x)) {
				var thisDuration = $scope.plansMaster[x]["secs"];
				if (thisDuration > customSecs) {
					var thisStageCustom = $scope.plansMaster[x]["stage"];
					console.log(thisStageCustom);
					break;
				}
			}
		}

		var newStageFromDogDo = thisStageCustom - 1;
		console.log(newStageFromDogDo);

		if (dogDo == 1) {
			exercise["finalDogDo"] = "Struggled";
		}
		if (dogDo == 2) {
			exercise["finalDogDo"] = "Okay";
		}
		if (dogDo == 3) {
			exercise["finalDogDo"] = "Aced It";
		}

	} else {
		//DOG MET TARGET DURATION - DROPDOWN YES
		if (dogDo == 1) {
			var newStageFromDogDo = $scope.stage - 1;
			exercise["finalDogDo"] = "Struggled";
		}
		if (dogDo == 2) {
			var newStageFromDogDo = $scope.stage;
			exercise["finalDogDo"] = "Okay";
		}
		if (dogDo == 3) {
			exercise["finalDogDo"] = "Aced It";
			if ($scope.splitLevel == "Level") {
				//Add 2
				var newStageFromDogDo = $scope.stage + 2;
			} else {
				//Add 1
				var newStageFromDogDo = $scope.stage + 1;
			}
		}
		var lastActualDuration = $scope.nextDuration;
	}
	console.log(exercise);
	console.log(customSecs);

	var dateRaw = exercise.date;
	var finalDate = moment(dateRaw).format("DD MMM YYYY");
    var dateGetTime = dateRaw.getTime();

	exercise.formattedDate = finalDate;
    exercise.dateGetTime = dateGetTime;

	var email = firebase.auth().currentUser.email;
	email = email.replace(/[^a-zA-Z0-9]/g, '');

	var dbRequest = indexedDB.open('userPWA', 2);
	dbRequest.onsuccess = function(e) {

		//PLAN DETAILS
		var thisDB = e.target.result;
		var transaction = thisDB.transaction(["userInfo"], "readwrite");
		var store = transaction.objectStore("userInfo");
		var planDetailsNew = {
			lastExercsieNo: $scope.exerciseNo,
			nextExercsieNo: $scope.exerciseNo + 1,
			lastStage: $scope.stage,
			lastDuration: $scope.nextDuration,
			lastActualDuration: lastActualDuration,
			nextStage: newStageFromDogDo
		};
		var request = store.put(planDetailsNew, 4);
		request.onerror = function(e) {
			console.log("Error", e.target.error.name);
		}
		request.onsuccess = function(e) {
			console.log("New Plan Details Updated");
			firebase.database().ref('Plans Details Three/' + email).set({
				planDetailsNew
			});
		}

		var requestAll = store.getAll();
		requestAll.onerror = function(e) {
			console.log("Error", e.target.error.name);
		}
		requestAll.onsuccess = function(e) {
			console.log(e);
			var allUserInfo = e.target.result;
			firebase.database().ref('User Info/' + email).update({
				allUserInfo
			});
		} 
        
		//PLANS NOTES
		var thisDB = e.target.result;
		var transaction = thisDB.transaction(["plansNotes"], "readwrite");
		var store = transaction.objectStore("plansNotes");

		var request = store.add(exercise);
		request.onerror = function(e) {
			console.log("Error", e.target.error.name);
		}
		request.onsuccess = function(e) {
			console.log("Plans Step 2 Notes Added to IDB");
		}

		var requestAll = store.getAll();
		requestAll.onerror = function(e) {
			console.log("Error", e.target.error.name);
		}
		requestAll.onsuccess = function(e) {
			console.log(e);
			var allPlansNotes = e.target.result;
			firebase.database().ref('Plans Notes Two/' + email).update({
				allPlansNotes
			});
			//alert("Exercise Data Saved!");
			$ionicPopup.alert({
				title: 'Alert',
				template: 'Exercise Data Saved!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
                
			});
			$state.go('tabs.plans');
		}        
	}
}
    
//    SCOPES FOR EXERCISE NOTES - INITIALIZATION ONLY
//    $scope.exercise = {
//        'date' : new Date(),
//        'duration' : '',
//        'dogDo' : '1',
//        'notes' : '',
//    };
    
    //STOPWATCH - https://codepad.co/snippet/YMYUDYgr
    $scope.start = function() {
        //var h1 = document.getElementsByTagName('h2')[0],
        //angular.element(document.getElementById('someElement'))
        var h1 = document.getElementById('stopwatch');
        if (h1.textContent != "00:00:00") {
            //Do Nothing
            if ($scope.running == true) {
                //Do Nothing
            } else {
            $scope.running = true; 
            var seconds = parseInt($scope.timeRun[2]);
            var minutes = parseInt($scope.timeRun[1]);
            var hours = parseInt($scope.timeRun[0]);
            $scope.t = setInterval(function(){ 
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
                if (minutes >= 60) {
                    minutes = 0;
                    hours++;
                }
            }

        h1.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);            
            }, 1000);                 
            }           
        } else {
        $scope.running = true;  
        var h1 = document.getElementById('stopwatch'),        
        seconds = 0, minutes = 0, hours = 0, t;
        console.log(h1);    
            $scope.t = setInterval(function(){ 
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
                if (minutes >= 60) {
                    minutes = 0;
                    hours++;
                }
            }

        h1.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);            
            }, 1000);
        }
    };    

    $scope.stop = function() {
        clearInterval($scope.t);
        $scope.running = false;
        var h1 = document.getElementById('stopwatch');
        $scope.h1Content = h1.textContent;
        $scope.timeRun = $scope.h1Content.split(":");
    };
   
    $scope.reset = function() {
        clearInterval($scope.t);
        $scope.running = false;
        var h1 = document.getElementById('stopwatch');
        h1.textContent = "00:00:00";
        seconds = 0; minutes = 0; hours = 0;
    };    
    //STOPWATCH - https://codepad.co/snippet/YMYUDYgr
    
    
//    MODAL
//    $ionicModal.fromTemplateUrl('templates/stopwatch.html', function(modal) {
//        $scope.modal = modal;
//      }, {
//        scope: $scope,
//        animation: 'slide-in-up',
//        focusFirstInput: true
//    });
//
//  $scope.openModal = function() {
//    $scope.modal.show();
//  };
//
//  $scope.hideModal = function() {
//    $scope.modal.hide();
//  };
//
//  $scope.doSomething = function(item) {
//    $scope.value = item;
//    $scope.modal.hide();
//  }; 
    
    //IDB
    var dbRequest = indexedDB.open('userPWA', 2); 

    //CHECK PLAN DETAILS
    //IF BLANK - GET INITIAL DURATION
        //GEN PLAN
    //ELSE USE PLAN DETAILS
        //GEN PLAN
    
    dbRequest.onsuccess = function(e) {
        //PLAN DETAILS - LAST PLAN/DURATION COMPLETED INFO
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(4);//
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);//
            var planDetails = e.target.result;
            $scope.planDetails = planDetails;              
   	    }
        
        //PLANS MASTER - Levels and Splits
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(3);
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);
            var plansMaster = e.target.result;
            $scope.plansMaster = plansMaster; 
   	    }        
        
        //INITIAL DURATION
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(1);
        checkUserInfo.onsuccess = function(e) {
            var initialDuration = e.target.result["duration"];
            $scope.initialDuration = initialDuration;   
            console.log(initialDuration);
            
            if ($scope.planDetails == undefined) {  //IF BLANK - GET INITIAL DURATION
            //INITIAL DURATION becomes LAST DURATION
                for (var x in $scope.plansMaster) {
                if ($scope.plansMaster.hasOwnProperty(x)) {
                    var thisDuration = $scope.plansMaster[x]["secs"]; // SECS
                    var thisSplitLevel = $scope.plansMaster[x]["splitLevel"]; //SPLIT LEVEL
                    var thisKey = $scope.plansMaster[x]["key"]; //KEY
                    var thisStage = $scope.plansMaster[x]["stage"]; //STAGE
                    if (thisDuration > initialDuration) {
                        //THIS LEVEL
                        initialDuration = Math.ceil(initialDuration/5)*5;
                        nextDuration = Math.ceil(nextDuration/5)*5;                        
                        var lastDuration = moment.utc(moment.duration(initialDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.lastDuration = lastDuration;
                        var nextDuration = moment.utc(moment.duration(thisDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.nextDuration = nextDuration;
                        $scope.showText = "BASED ON YOUR INITIAL ASSESSMENT";
                        $scope.splitLevel = thisSplitLevel;////////////
                        console.log($scope.splitLevel);
                        $scope.thisExercise = $scope.plansMaster[x]; //THIS EXERCISE (LEVEL)
                        console.log($scope.thisExercise);
                        var thisExerciseFormatted = {}; //FORMAT EXERCISE
                        for (var z in $scope.thisExercise) {
                          if ($scope.thisExercise.hasOwnProperty(z)) {
                              if ($scope.thisExercise[z]["secs"]) {
                                var secs = Math.round($scope.thisExercise[z]["secs"]);
                                var thisStep = $scope.thisExercise[z]["step"];
                                var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                thisExerciseFormatted[z] = {};
                                thisExerciseFormatted[z]["secs"] = thisSecs;
                                thisExerciseFormatted[z]["step"] = thisStep;
                                thisExerciseFormatted[z]["comments"] = "";
                                thisExerciseFormatted[z]["duration"] = secs;
                              }
                          }  
                        }
                        $scope.thisExerciseFormatted = thisExerciseFormatted;
                        console.log(thisExerciseFormatted);
                        //NEW PLAN DETAILS
                        $scope.exerciseNo = 1;
                        $scope.lastLevel = thisSplitLevel+thisKey;
                        $scope.stage = thisStage;
                            $scope.exercise = {
                                'date' : new Date(),
                                'actualDuration' : thisDuration,
                                'comfDuration' : thisDuration,
                                'dogDo' : '1',
                                'notes' : '',
                                'exerciseNo' : $scope.exerciseNo,
                                'stage' : $scope.stage,
                                'lastDuration': $scope.lastDuration,
                                'thisExerciseDuration': $scope.nextDuration
                            };
                        break;
                    }
                } 
            } 
            } else {
                console.log($scope.planDetails);
                //Plan Details Exists
                //GET LAST DURATION
                //NEXT DURATION
                var lastDuration = $scope.planDetails["lastDuration"];
                var nextStage = $scope.planDetails["nextStage"];  
                if (nextStage > 59) {
                    nextStage = 59;
                }
                var nextExerciseNo = $scope.planDetails["nextExercsieNo"];  
                $scope.lastDuration = lastDuration;
                for (var x in $scope.plansMaster) {
                if ($scope.plansMaster.hasOwnProperty(x)) {
                    var thisDuration = $scope.plansMaster[x]["secs"]; // SECS
                    var thisSplitLevel = $scope.plansMaster[x]["splitLevel"]; //SPLIT LEVEL
                    var thisStage = $scope.plansMaster[x]["stage"]; //STAGE
                    if (thisStage == nextStage) {
                        thisDuration = Math.ceil(thisDuration/5)*5;
                        var nextDuration = moment.utc(moment.duration(thisDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.nextDuration = nextDuration;    
                        $scope.splitLevel = thisSplitLevel;////////////
                        console.log($scope.splitLevel);                        
                        $scope.thisExercise = $scope.plansMaster[x];//
                        var thisExerciseFormatted = {}; //FORMAT EXERCISE
                        for (var z in $scope.thisExercise) {
                          if ($scope.thisExercise.hasOwnProperty(z)) {
                              if ($scope.thisExercise[z]["secs"]) {
                                var secs = Math.round($scope.thisExercise[z]["secs"]);
                                var thisStep = $scope.thisExercise[z]["step"];
                                var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                thisExerciseFormatted[z] = {};
                                thisExerciseFormatted[z]["secs"] = thisSecs;
                                thisExerciseFormatted[z]["step"] = thisStep;
                                thisExerciseFormatted[z]["comments"] = "";
                                thisExerciseFormatted[z]["duration"] = secs;
                              }
                          }  
                        }
                        $scope.thisExerciseFormatted = thisExerciseFormatted;
                        console.log(thisExerciseFormatted);
                        //NEW PLAN DETAILS
                        $scope.exerciseNo = nextExerciseNo;
                        $scope.stage = thisStage;
                            $scope.exercise = {
                                'date' : new Date(),
                                'actualDuration' : thisDuration,
                                'comfDuration' : thisDuration,
                                'dogDo' : '1',
                                'notes' : '',
                                'exerciseNo' : $scope.exerciseNo,
                                'stage' : $scope.stage,
                                'lastDuration': $scope.lastDuration,
                                'thisExerciseDuration': $scope.nextDuration
                            };
                        break;                       
                    }
                    }
                }
            }
   	    }        
   	}
})

.controller('plansExerciseNewCtrlCustom', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $interval, $ionicModal, $ionicLoading, $ionicPopup) {
   	//STEP 1
    $scope.submitPlan = function(thisExerciseFormattedFinal) {
        //ADD TO FB and PLANS INFO
        var email = firebase.auth().currentUser.email;
        email = email.replace(/[^a-zA-Z0-9]/g, '');
        
        var dbRequest = indexedDB.open('userPWA', 2); 
        
        dbRequest.onsuccess = function(e) {
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["plansInfo"], "readwrite");
   	    var store = transaction.objectStore("plansInfo");
        
        var request = store.add(thisExerciseFormattedFinal);
					request.onerror = function(e) {
						console.log("Error", e.target.error.name);
					}
					request.onsuccess = function(e) {
						console.log("Plans Step 1 Info Added to IDB");
					}
                
                    var requestAll = store.getAll();
					requestAll.onerror = function(e) {
						console.log("Error", e.target.error.name);
					}
					requestAll.onsuccess = function(e) {
						console.log(e);
                        var allPlansData = e.target.result;
                        firebase.database().ref('Plans Info One/'+email).update({allPlansData});
					}
                    
        var transaction = thisDB.transaction(["userInfo"], "readwrite");
   	    var store = transaction.objectStore("userInfo");
            
        var request = store.put("Custom", 6);
            request.onerror = function(e) {
                console.log("Error", e.target.error.name);
            }
            request.onsuccess = function(e) {
                console.log("Data Added Store 6");
            }                    
                    $state.go('tabs.plansExerciseNewNotesCustom');
        }
    }
    
    //STEP 2
    $scope.saveExercise = function(exercise,next) {
        var dogDo = exercise.dogDo;
        
        if (exercise.checked == undefined) {
            //alert('Please fill in all Queries');
            $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Please fill in all Queries!',
                        buttons: [
                          {
                            text: '<b>OK</b>',
                            type: 'button-assertive',
                          }
                        ]                  
            });            
            return;
        }
        
        if (exercise.checked == 'No') {
            //DOG DID NOT MEET DURATION - GET HH MM SS
            console.log(next);
            
            if (next == undefined) {
                //alert('Please enter a duration your dog was comfortable with!');
            $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Please enter a duration your dog was comfortable with!',
                        buttons: [
                          {
                            text: '<b>OK</b>',
                            type: 'button-assertive',
                          }
                        ]                  
            });                
				return;
            }
            if (next.hours == undefined || next.minutes == undefined || next.seconds == undefined) {
                //alert('Please enter a duration your dog was comfortable with!');
            $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Please enter a duration your dog was comfortable with!',
                        buttons: [
                          {
                            text: '<b>OK</b>',
                            type: 'button-assertive',
                          }
                        ]                  
            });                
				return;                
            }
            
            var hours = next.hours;
            var secsInHours = hours * 60 * 60;
            var minutes = next.minutes;
            var seconds = next.seconds;
            var customSecs = (minutes * 60) + seconds + secsInHours;
            console.log(customSecs);
            
            if (customSecs > 5400) {
                customSecs = 5400;
            }
            
            var lastActualDuration = moment.utc(moment.duration(customSecs,"seconds").asMilliseconds()).format("HH:mm:ss");
            exercise["comfDuration"] = customSecs;            
            
            if (dogDo == 1) {
            exercise["finalDogDo"] = "Struggled";
            }
            if (dogDo == 2) {
            exercise["finalDogDo"] = "Okay";
            }
            if (dogDo == 3) {
            exercise["finalDogDo"] = "Aced It";
            }        
            
        } else {
            //DOG MET TARGET DURATION - DROPDOWN YES
            if (dogDo == 1) {
                exercise["finalDogDo"] = "Struggled";
            }
            if (dogDo == 2) {
                exercise["finalDogDo"] = "Okay";
            }
            if (dogDo == 3) {
                exercise["finalDogDo"] = "Aced It";
            }
            var lastActualDuration = $scope.duration;
        }     
        //
        
        var dateRaw = exercise.date;
        var finalDate = moment(dateRaw).format("DD MMM YYYY");
        
        exercise.formattedDate = finalDate;
//        exercise.exerciseNo = "Custom Duration";
        exercise.exerciseNo = $scope.exerciseNo;
        
        var email = firebase.auth().currentUser.email;
        email = email.replace(/[^a-zA-Z0-9]/g, '');
        
        var dbRequest = indexedDB.open('userPWA', 2); 
        dbRequest.onsuccess = function(e) {
        
        //PLAN DETAILS
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readwrite");
   	    var store = transaction.objectStore("userInfo");            
            var planDetailsNew = {
				lastExercsieNo: $scope.exerciseNo,
                nextExercsieNo: $scope.exerciseNo + 1,
                lastStage: $scope.stage,
                lastDuration: $scope.duration,
                lastActualDuration: lastActualDuration,
                nextStage: $scope.stage
            };
            var request = store.put(planDetailsNew, 4);
				request.onerror = function(e) {
                    console.log("Error", e.target.error.name);    
					}
					request.onsuccess = function(e) {
						console.log("New Plan Details Updated");
                        firebase.database().ref('Plans Details Three/'+email).set({planDetailsNew});
					}

		var requestAll = store.getAll();
		requestAll.onerror = function(e) {
			console.log("Error", e.target.error.name);
		}
		requestAll.onsuccess = function(e) {
			console.log(e);
			var allUserInfo = e.target.result;
			firebase.database().ref('User Info/' + email).update({
				allUserInfo
			});
		}                    
                    
            
        //PLANS NOTES
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["plansNotes"], "readwrite");
   	    var store = transaction.objectStore("plansNotes");
        
        var request = store.add(exercise);
        request.onerror = function(e) {
            console.log("Error", e.target.error.name); 
        }
        request.onsuccess = function(e) {
            console.log("Plans Step 2 Notes Added to IDB");
        }
                
        var requestAll = store.getAll();
        requestAll.onerror = function(e) {
            console.log("Error", e.target.error.name);
        }
        requestAll.onsuccess = function(e) {
            console.log(e);
            var allPlansNotes = e.target.result;
            firebase.database().ref('Plans Notes Two/'+email).update({allPlansNotes});
            $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Exercise Data Saved!',
                        buttons: [
                          {
                            text: '<b>OK</b>',
                            type: 'button-assertive',
                          }
                        ]                  
            });            
            //alert("Exercise Data Saved!");
            $state.go('tabs.plans');
        }        
        }        
    }    
    
    //STOPWATCH - https://codepad.co/snippet/YMYUDYgr
    $scope.start = function() {
        var h1 = document.getElementById('stopwatch');
        if (h1.textContent != "00:00:00") {
            //Do Nothing
            if ($scope.running == true) {
                //Do Nothing
            } else {
            $scope.running = true; 
            var seconds = parseInt($scope.timeRun[2]);
            var minutes = parseInt($scope.timeRun[1]);
            var hours = parseInt($scope.timeRun[0]);
            $scope.t = setInterval(function(){ 
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
                if (minutes >= 60) {
                    minutes = 0;
                    hours++;
                }
            }

        h1.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);            
            }, 1000);                 
            }           
        } else {
        if ($scope.running == true) {
            //Do Nothing
        } else {
            $scope.running = true;  
            var h1 = document.getElementById('stopwatch'),        
            seconds = 0, minutes = 0, hours = 0, t;
            console.log(h1);    
                $scope.t = setInterval(function(){ 
                seconds++;
                if (seconds >= 60) {
                    seconds = 0;
                    minutes++;
                    if (minutes >= 60) {
                        minutes = 0;
                        hours++;
                    }
                }

            h1.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);            
                }, 1000);            
            }
        }
    };    

    $scope.stop = function() {
        clearInterval($scope.t);
        $scope.running = false;
        var h1 = document.getElementById('stopwatch');
        $scope.h1Content = h1.textContent;
        $scope.timeRun = $scope.h1Content.split(":");
    };
   
    $scope.reset = function() {
        clearInterval($scope.t);
        $scope.running = false;
        var h1 = document.getElementById('stopwatch');
        h1.textContent = "00:00:00";
        seconds = 0; minutes = 0; hours = 0;
    };    
    //STOPWATCH - https://codepad.co/snippet/YMYUDYgr
    
    
    //IDB 1
    var dbRequest = indexedDB.open('userPWA', 2); 

    dbRequest.onsuccess = function(e) {
        //PLAN DETAILS - LAST PLAN/DURATION COMPLETED INFO
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(4);//
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);//
            var planDetails = e.target.result;
            $scope.planDetails = planDetails;              
   	    }
        
        //PLANS MASTER - Levels and Splits
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(3);
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);
            var plansMaster = e.target.result;
            $scope.plansMaster = plansMaster; 
   	    }        
        
        //INITIAL DURATION
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(1);
        checkUserInfo.onsuccess = function(e) {
            var initialDuration = e.target.result["duration"];
            $scope.initialDuration = initialDuration;   
            console.log(initialDuration);
            
            if ($scope.planDetails == undefined) {  //IF BLANK - GET INITIAL DURATION
            //INITIAL DURATION becomes LAST DURATION
                for (var x in $scope.plansMaster) {
                if ($scope.plansMaster.hasOwnProperty(x)) {
                    var thisDuration = $scope.plansMaster[x]["secs"]; // SECS
                    var thisSplitLevel = $scope.plansMaster[x]["splitLevel"]; //SPLIT LEVEL
                    var thisKey = $scope.plansMaster[x]["key"]; //KEY
                    var thisStage = $scope.plansMaster[x]["stage"]; //STAGE
                    if (thisDuration > initialDuration) {
                        //THIS LEVEL
                        initialDuration = Math.ceil(initialDuration/5)*5;
                        nextDuration = Math.ceil(nextDuration/5)*5;                        
                        var lastDuration = moment.utc(moment.duration(initialDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.lastDuration = lastDuration;
                        var nextDuration = moment.utc(moment.duration(thisDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.nextDuration = nextDuration;
                        $scope.showText = "BASED ON YOUR INITIAL ASSESSMENT";
                        $scope.thisExercise = $scope.plansMaster[x]; //THIS EXERCISE (LEVEL)
                        console.log($scope.thisExercise);
                        var thisExerciseFormatted = {}; //FORMAT EXERCISE
                        for (var z in $scope.thisExercise) {
                          if ($scope.thisExercise.hasOwnProperty(z)) {
                              if ($scope.thisExercise[z]["secs"]) {
                                var secs = Math.round($scope.thisExercise[z]["secs"]);
                                var thisStep = $scope.thisExercise[z]["step"];
                                var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                thisExerciseFormatted[z] = {};
                                thisExerciseFormatted[z]["secs"] = thisSecs;
                                thisExerciseFormatted[z]["step"] = thisStep;
                                thisExerciseFormatted[z]["comments"] = "";
                              }
                          }  
                        }
                        $scope.thisExerciseFormatted = thisExerciseFormatted;
                        console.log(thisExerciseFormatted);
                        //NEW PLAN DETAILS
                        $scope.exerciseNo = 1;
                        $scope.lastLevel = thisSplitLevel+thisKey;
                        $scope.stage = thisStage;
                            $scope.exercise = {
                                'date' : new Date(),
                                'actualDuration' : thisDuration,
                                'comfDuration' : thisDuration,
                                'dogDo' : '1',
                                'notes' : '',
                                'exerciseNo' : $scope.exerciseNo,
                                'stage' : $scope.stage,
                                'lastDuration': $scope.lastDuration,
                                'thisExerciseDuration': $scope.nextDuration
                            };
                        break;
                    }
                } 
            } 
            } else {
                console.log($scope.planDetails);
                //Plan Details Exists
                //GET LAST DURATION
                //NEXT DURATION
                var lastDuration = $scope.planDetails["lastDuration"];
                var nextStage = $scope.planDetails["nextStage"];  
                var nextExerciseNo = $scope.planDetails["nextExercsieNo"];  
                $scope.lastDuration = lastDuration;
                for (var x in $scope.plansMaster) {
                if ($scope.plansMaster.hasOwnProperty(x)) {
                    var thisDuration = $scope.plansMaster[x]["secs"]; // SECS
                    var thisStage = $scope.plansMaster[x]["stage"]; //STAGE
                    if (thisStage == nextStage) {
                        thisDuration = Math.ceil(thisDuration/5)*5;
                        var nextDuration = moment.utc(moment.duration(thisDuration,"seconds").asMilliseconds()).format("HH:mm:ss");
                        $scope.nextDuration = nextDuration;     
                        $scope.thisExercise = $scope.plansMaster[x];//
                        var thisExerciseFormatted = {}; //FORMAT EXERCISE
                        for (var z in $scope.thisExercise) {
                          if ($scope.thisExercise.hasOwnProperty(z)) {
                              if ($scope.thisExercise[z]["secs"]) {
                                var secs = Math.round($scope.thisExercise[z]["secs"]);
                                var thisStep = $scope.thisExercise[z]["step"];
                                var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                thisExerciseFormatted[z] = {};
                                thisExerciseFormatted[z]["secs"] = thisSecs;
                                thisExerciseFormatted[z]["step"] = thisStep;
                                thisExerciseFormatted[z]["comments"] = "";
                              }
                          }  
                        }
                        $scope.thisExerciseFormatted = thisExerciseFormatted;
                        console.log(thisExerciseFormatted);
                        //NEW PLAN DETAILS
                        $scope.exerciseNo = nextExerciseNo;
                        $scope.stage = thisStage;
                            $scope.exercise = {
                                'date' : new Date(),
                                'actualDuration' : thisDuration,
                                'comfDuration' : thisDuration,
                                'dogDo' : '1',
                                'notes' : '',
                                'exerciseNo' : $scope.exerciseNo,
                                'stage' : $scope.stage,
                                'lastDuration': $scope.lastDuration,
                                'thisExerciseDuration': $scope.nextDuration
                            };
                        break;                       
                    }
                    }
                }
            }
   	    }        
   	}    
    
    
    //IDB 2
    var dbRequest = indexedDB.open('userPWA', 2); 
    dbRequest.onsuccess = function(e) {
        //PLAN DETAILS - LAST PLAN/DURATION COMPLETED INFO
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(4);//
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);//
            var planDetails = e.target.result;
            $scope.planDetails = planDetails;              
   	    }        
        
        //CUSTOM DURATION
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(5);//
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);//
            $scope.thisExercise = e.target.result;
            //$scope.thisExerciseFormatted = $scope.thisExercise;
            var duration = $scope.thisExercise["duration"];
            var actualDuration = $scope.thisExercise["actualDuration"];
            $scope.duration = duration;
            
                            $scope.exercise = {
                                'date' : new Date(),
                                'actualDuration' : actualDuration,
                                'comfDuration' : actualDuration,
                                'dogDo' : '1',
                                'notes' : '',
                                'thisExerciseDuration': duration
                            };
            
                        var thisExerciseFormatted = {};
                        for (var z in $scope.thisExercise) {
                          if ($scope.thisExercise.hasOwnProperty(z)) {
                              if ($scope.thisExercise[z]["secs"]) {
                                  var secs = $scope.thisExercise[z]["secs"];
                                  var thisStep = $scope.thisExercise[z]["step"];
                                  var thisDuration = $scope.thisExercise[z]["duration"];
//                                  var thisSecs = moment.utc(moment.duration(secs,"seconds").asMilliseconds()).format("HH:mm:ss"); 
                                    thisExerciseFormatted[z] = {};
                                  thisExerciseFormatted[z]["secs"] = secs;
                                  thisExerciseFormatted[z]["step"] = thisStep;
                                  thisExerciseFormatted[z]["comments"] = "";
                                  thisExerciseFormatted[z]["duration"] = thisDuration;
                              }
                          }  
                        }
                        $scope.thisExerciseFormatted = thisExerciseFormatted;
                        console.log(thisExerciseFormatted);    
   	    }            
   	}    
})

.controller('pdqCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $ionicScrollDelegate, $ionicLoading, $ionicPopup) { 
// ORIGINAL SAVE TO FIREBASE    
//   	$scope.theOriginalCueList = [
//        {"text":"Bag","checked":false,"show":true},
//        {"text":"Jacket","checked":false,"show":true},
//        {"text":"Shoes","checked":false,"show":true},
//        {"text":"Turn TV On/Off","checked":false,"show":true},
//        {"text":"Turn Radio On/Off","checked":false,"show":true},
//        {"text":"Put on Shoes","checked":false,"show":true},
//        {"text":"Put Dog in Crate","checked":false,"show":true},
//        {"text":"Pick up Keys","checked":false,"show":true},
//        {"text":"Set Alarm","checked":false,"show":true},
//        {"text":"Take Phone off Charger","checked":false,"show":true},
//        {"text":"Pack-up Laptop","checked":false,"show":true},
//        {"text":"Pack Lunch","checked":false,"show":true},
//        {"text":"Pack Workbag","checked":false,"show":true},
//        {"text":"Pack School Bag","checked":false,"show":true},
//        {"text":"Clean-out Purse","checked":false,"show":true},
//        {"text":"Grab Kong","checked":false,"show":true},
//        {"text":"Brush Teeth","checked":false,"show":true},
//        {"text":"Put on Perfume","checked":false,"show":true},
//        {"text":"Put on Makeup","checked":false,"show":true},
//        {"text":"Blwodry Hair","checked":false,"show":true},
//        {"text":"Shower","checked":false,"show":true},
//        {"text":"Make the Bed","checked":false,"show":true},
//        {"text":"Kiss your Partner","checked":false,"show":true},
//        {"text":"Be in a Rush","checked":false,"show":true},
//        {"text":"Go for a Walk","checked":false,"show":true},
//        {"text":"Wash Hands","checked":false,"show":true},
//        {"text":"Eat Breakfast","checked":false,"show":true},
//        {"text":"Make Coffee","checked":false,"show":true},
//        {"text":"Grab a piece of Fruit","checked":false,"show":true},
//        {"text":"Grab Umbrella","checked":false,"show":true},
//        {"text":"Put on Jacket","checked":false,"show":true},
//        {"text":"Put on Scarf","checked":false,"show":true},
//        {"text":"Put on Hat","checked":false,"show":true},
//        {"text":"Put on Glasses","checked":false,"show":true},
//        {"text":"Put on Shoes","checked":false,"show":true},
//        {"text":"Put on Boots","checked":false,"show":true},
//        {"text":"Put on Flip-flops","checked":false,"show":true},
//        {"text":"Can you go get the mail?","checked":false,"show":true},
//        {"text":"Can you take out the Trash?","checked":false,"show":true},
//        {"text":"Can you go to the Bedorrom and shut the Door?","checked":false,"show":true},
//        {"text":"No Laundry?","checked":false,"show":true}];
//    var theOriginalCueList = $scope.theOriginalCueList;
//    firebase.database().ref('Original Cue List').set({theOriginalCueList});
//    
//    firebase.database().ref('Cue Lists').once('value').then(function(snapshot) {
//    console.log(snapshot.val);
//  // ...
//});
  
    var dbRequest = indexedDB.open('userPWA', 2);
    dbRequest.onsuccess = function(e) {
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["sessionInfo"], "readonly");
   	    var store = transaction.objectStore("sessionInfo");
        var request = store.getAll();
        request.onsuccess = function(e) {
            console.log(e.target.result);
            var compSessions = e.target.result;
            $scope.compSessions = compSessions;
            console.log(compSessions);
             if (compSessions != "") {
                $scope.showHelp = true;
            } else {
                $scope.showHelp = false;
            }
            console.log($scope.showHelp);
   	    }
   	}
  
  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
    $ionicScrollDelegate.resize();
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
    
})

.controller('cueList', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $ionicLoading, $ionicPopup) {
        $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
        });    
    var dbRequest = indexedDB.open('userPWA', 2);
    dbRequest.onsuccess = function(e) {
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(2);
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);
            var result = e.target.result;
            $scope.originalCueList = result;
            console.log(result);
   	    }
   	}
    $ionicLoading.hide();
   	$scope.saveList = function() {
        $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
        });        
        var thisUserCueList = angular.copy($scope.originalCueList);
        console.log(thisUserCueList);
        
        var email = firebase.auth().currentUser.email;
        email = email.replace(/[^a-zA-Z0-9]/g, '');
        firebase.database().ref('Cue Lists/'+email).set({thisUserCueList});
        
   		var dbRequest = indexedDB.open('userPWA', 2);
   		dbRequest.onsuccess = function(e) {
   			var thisDB = e.target.result;
   			var transaction = thisDB.transaction(["userInfo"], "readwrite");
   			var store = transaction.objectStore("userInfo");

   			var checkUserInfo = store.get(2);
            
   			checkUserInfo.onsuccess = function(e) {
   					var request = store.put(thisUserCueList, 2);
   					request.onerror = function(e) {
   						console.log("Error", e.target.error.name);
                        console.log('Error in Saving Cue List Info');
   					}
   					request.onsuccess = function(e) {
   						console.log('User Saved Info');
   					}
   			}          
   		}  
        $ionicLoading.hide();
   	}
    
   	$scope.saveListTwo = function() {
        $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
        });        
        var thisUserCueList = angular.copy($scope.originalCueList);
        console.log(thisUserCueList);
        
        var email = firebase.auth().currentUser.email;
        email = email.replace(/[^a-zA-Z0-9]/g, '');
        firebase.database().ref('Cue Lists/'+email).set({thisUserCueList});
        
   		var dbRequest = indexedDB.open('userPWA', 2);
   		dbRequest.onsuccess = function(e) {
   			var thisDB = e.target.result;
   			var transaction = thisDB.transaction(["userInfo"], "readwrite");
   			var store = transaction.objectStore("userInfo");
                          
   			var checkUserInfo = store.get(2);
            
   			checkUserInfo.onsuccess = function(e) {
   					var request = store.put(thisUserCueList, 2);
   					request.onerror = function(e) {
   						console.log("Error", e.target.error.name);
                        console.log('Error in Saving Cue List Info');
   					}
   					request.onsuccess = function(e) {
   						console.log('User Saved Info');
                        $ionicPopup.alert({
                            title: 'Alert',
                            template: 'Changes Saved!',
                            buttons: [
                              {
                                text: '<b>OK</b>',
                                type: 'button-assertive',
                              }
                            ]                              
                        });                        
                        //alert('Changes Saved!');
                        $state.go('tabs.pdq');
   					}
   			}
   		}
        $ionicLoading.hide();
   	}    
})

.controller('newSession', function($scope, $stateParams, $state, $ionicHistory, $ionicActionSheet, $ionicLoading, $ionicPopup) {
        $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
        });    
    var dbRequest = indexedDB.open('userPWA', 2);
    dbRequest.onsuccess = function(e) {
        var thisDB = e.target.result;
        var transaction = thisDB.transaction(["userInfo"], "readonly");
   	    var store = transaction.objectStore("userInfo");
        var checkUserInfo = store.get(2);
        checkUserInfo.onsuccess = function(e) {
            console.log(e.target.result);
            var result = e.target.result;
            $scope.originalCueList = result;
            console.log(result);
   	    }
   	}
    
    $scope.checkedItems = {};
    $ionicLoading.hide();
    
	$scope.saveSession = function(session, checkedItems) {
        if (session == undefined) {
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please make sure that all responses are filled in properly!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
            //alert('Please make sure that all responses are filled in properly');
            return;
        }
        
        console.log(checkedItems);
      var result = "";
      for (var p in checkedItems) {
        if(checkedItems.hasOwnProperty(p)) {
          result += p + ", ";
        } 
      }              
      var finalCheckedItems = result.slice(0,-2);
      console.log(finalCheckedItems);

		var date = session.date;
		console.log(date);
//		var cue = session.cue;
//		console.log(cue);        
        var dogDo = session.dogDo;
		console.log(dogDo);
        var notes = session.notes;
		console.log(notes);
        var dateFormatted = moment(date).format("DD MMM YYYY");
        console.log(dateFormatted);
        
        var email = firebase.auth().currentUser.email;
        email = email.replace(/[^a-zA-Z0-9]/g, '');
        
        if (date == undefined || checkedItems == undefined || dogDo == undefined) {
        $ionicPopup.alert({
            title: 'Alert',
            template: 'Please make sure that all responses are filled in properly!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]              
        });            
            //alert('Please make sure that all responses are filled in properly');
            return;
        }

        $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
        });
        
        if(notes == undefined) {
            notes = "";
        }
        
		//Add Session Info to IDB
		var sessionInfo = {
			date: session.date,
			//cue: session.cue.text,
            cues: finalCheckedItems,
			dogDo: session.dogDo,
			notes: notes,
            action: "sessionInfo",
            dateFormatted: dateFormatted,
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
			var dbRequest = indexedDB.open('userPWA', 2);
			dbRequest.onsuccess = function(e) {

				var thisDB = e.target.result;
				var transaction = thisDB.transaction(["sessionInfo"], "readwrite");
				var store = transaction.objectStore("sessionInfo");

					var request = store.add(sessionInfo);
					request.onerror = function(e) {
						console.log("Error", e.target.error.name);
					}
					request.onsuccess = function(e) {
						console.log("Session Info Added to IDB");
					}
					console.log(sessionInfo);
                
                    var requestAll = store.getAll();
					requestAll.onerror = function(e) {
						console.log("Error", e.target.error.name);
					}
					requestAll.onsuccess = function(e) {
						console.log(e);
                        var allSessionsData = e.target.result;
                        firebase.database().ref('User Sessions/'+email).update({allSessionsData});
					}                
			}
		}
        
		//callbackOne(sessionInfo);
        document.getElementById("newSessionForm").reset();   
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Information Saved!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                
            });        
        //alert("Information Saved");
        $ionicLoading.hide();
        $state.go('tabs.pdq');
	}  

	//Callback Function being Used - To Send Info to Google Sheet
//	$scope.sessInfoToGS = function(sessionInfo) {
//		console.log(sessionInfo);
//		//AJAX Request for Session Info
//		var scriptURL = "https://script.google.com/macros/s/AKfycbwZudWFBVd6k3dtxQMjhY_s4kwiYcPKms-9tjRI9vbcfnFBaFc/exec";
//		var request = $.ajax({
//			url: scriptURL,
//			method: "GET",
//			data: sessionInfo,
//			dataType: "jsonp",
//		});
//		console.log(request);
//		request.done(function(response, textStatus, jqXHR) {
//			console.log(response);
//            document.getElementById("newSessionForm").reset();              
//			//alert("Session Information Saved");
//            $state.go('tabs.pdq');
//		});
//	}    
})

.controller('passwordResetFromAppCtrl', function($scope, $stateParams, $state, $location, $ionicHistory, $ionicPopup) {
	//$scope.email = $stateParams.email; console.log($scope.email);
	//    $scope.query = $location.search(); console.log($scope.query);
	//    var code = $scope.query.oobCode; console.log(code);

	$scope.resetPasswordFromApp = function(password) {
		if (!password) {
			//alert("Please enter valid passwords");
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please enter valud Passwords!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
			return;
		}
		var passwordA = password.a;
		console.log(passwordA);
		var passwordB = password.b;
		console.log(passwordB);
		var passwordC = password.c;
		console.log(passwordC);

		if (passwordB != passwordC) {
			//alert("Passwords do not match");
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Passwords do not match!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
			return;
		}

		if (passwordA == undefined || passwordB == undefined || passwordC == undefined) {
			//alert("Please enter valid passwords");
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Please enter valid Passwords!',
                buttons: [
                  {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                  }
                ]                  
            });            
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
                        $ionicPopup.alert({
                                    title: 'Alert',
                                    template: 'Password Update successful! Please login with your new Password!',
                                    buttons: [
                                      {
                                        text: '<b>OK</b>',
                                        type: 'button-assertive',
                                      }
                                    ]                              
                        });                        
                        //alert("Password Update successful! Please login with your new Password!");
                        firebase.auth().signOut();
                        $ionicHistory.nextViewOptions({
                                disableBack: true
                        });         
                        $state.go('app.login');                        
					}).catch(function(error) {
						console.log(error);
                        $ionicPopup.alert({
                                    title: 'Alert',
                                    template: 'Server Error, please try again later!',
                                    buttons: [
                                      {
                                        text: '<b>OK</b>',
                                        type: 'button-assertive',
                                      }
                                    ]                              
                        });                        
                        //alert("Server Error, please try again later!");
					});
				}).catch(function(error) {
					var errorCode = error.code;
					var errorMessage = error.message;
					if (errorCode == 'auth/wrong-password') {
						//alert('Incorrect Password');
                    $ionicPopup.alert({
                                title: 'Alert',
                                template: 'Incorrect Password!',
                                buttons: [
                                  {
                                    text: '<b>OK</b>',
                                    type: 'button-assertive',
                                  }
                                ]                          
                    });                        
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

;