angular.module('app')
  .controller('LoginCtrl', function($http, $window) {

    const that = this;

    this.signup = function() {
      un = this.accName;
      pw = this.accPw;
      vpw = this.accVerifyPw;
      if (pw === vpw) {
        $http.post('http://localhost:8080/auth/signup', {
          username: un,
          password: pw
        }).then(function(response) {
          if (response.status === 200) {
            alert('check your email to finish registering with Bogus Story Meter; in the meantime, checkout our home page');
            $window.location.href = '/home';
          }
        }, function(err) {
            if (err.status === 401) {
              that.accName = '';
              that.accPw = '';
              that.accVerifyPw = '';
              alert(err.data);
            } else if (err.status === 500) {
              that.accName = '';
              that.accPw = '';
              that.accVerifyPw = '';
              alert('there was an error, please try signing up again');
            }
            console.error(err);
        });
      } else {
        alert('your passwords do not match; please try again');
        this.accName = '';
        this.accPw = '';
        this.accVerifyPw = '';
      }
    };

    this.login = function() {
      un = this.loginName;
      pw = this.loginPw;
      $http.post('http://localhost:8080/auth/login', {
          username: un,
          password: pw
        }).then(function(response) {
          if (response.status === 200) {
            $window.location.href = '/profile';
          }
        }, function(err) {
          if (err.status === 400) {
            that.loginName = '';
            that.loginPw = '';
            alert(err.data);
            console.error(err);
          }
        });
    };

  })
  .component('login', {
    templateUrl: './templates/login.html',
    controller: 'LoginCtrl'
  });