angular.module('app', [])

  .controller('AppCtrl', function($scope, request) {

    var that = this;

    this.rating = null;
    this.urlId = null;
    this.currentUser = null;
    this.uservote = null;
    this.url = null;
    this.fullName = null;
    this.profilePicture = null;
    this.categories = null;
    this.title = null;
    this.upvotebtn = '';
    this.downvotebtn = '';
    if (this.uservote) {
      this[this.uservote+'btn'] = 'pressed';
    }

    console.log(this.upvotebtn)
    // chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    // Use the token.
      // console.log('new token: ', token, new Date());
      // if (token) {
        // this.loggedIn = true;
        // $scope.$apply();

        // let errMsg = 'could not get profile information';

        // request.getGoogleProfile(token, null, null, errMsg, profileInfo => {
        //   console.log(profileInfo);
        //   this.fullName = profileInfo.data.name;
        //   this.profilePicture = profileInfo.data.picture;
        // });
    //   }
    // }.bind(this));

    chrome.runtime.sendMessage({msg: 'Give me data on this tab'});

    chrome.extension.onMessage.addListener(function(urlObj) {
      console.log('from background ', urlObj)
      that.rating = urlObj.rating;
      that.urlId = urlObj.urlId;
      that.url = urlObj.tabUrl;
      that.currentUser = urlObj.username;
      that.uservote = urlObj.uservote;
      if (that.uservote) {
        that[that.uservote+'btn'] = 'pressed';
      }
          console.log(that.upvotebtn)

      that.name = urlObj.name;
      that.profilePicture = urlObj.profilepicture;

      //WATSON CALL
      // request.getCategory(that.url, 'could not retrieve data from Watson', (getCategoryRes) => {
      //   that.title = getCategoryRes.metadata.title;
      //   that.categories = getCategoryRes.categories;
      //   console.log(getCategoryRes)
      // })

      if (that.rating === 0) {
        that.rated = true;
      } else {
        that.rated = !!that.rating;
      }
      $scope.$apply();
    });

    this.handleProfile = () => {
      chrome.tabs.create({url: `${window.serverUri}/profile` });
      window.close();
    };

    this.handleVote = (vote) => {
      if (this.url === null) {
        return;
      }
      var data = {
        urlId: this.urlId,
        url: this.url,
        username: this.currentUser,
        type: vote,
        title: this.title,
        categories: this.categories
      };
      let errMsg = 'Could not submit vote: ';

      console.log('inside handlevote - data ', data)

      // if user hasnt voted before, new vote:
      if (this.uservote === null) {
        request.post('/urlvote', data, errMsg, (postResponse) => {
          that.urlId = postResponse;
          request.get(`/urlvote/${that.urlId}`, null, null, errMsg, (getResponse) => {
            that.rating = getResponse;
            that.uservote = vote;
            that[vote+'btn'] = 'pressed';
            chrome.runtime.sendMessage({'rating': that.rating, 'uservote': that.uservote, 'urlId': that.urlId});
          });
        });
      } else if (this.uservote !== vote) { // if user is changing vote
        request.put('/urlvote', data, errMsg, (postResponse) => {
          that.urlId = postResponse;
          request.get(`/urlvote/${that.urlId}`, null, null, errMsg, (getResponse) => {
            that[that.uservote+'btn'] = '';
            that[vote+'btn'] = 'pressed';
            that.rating = getResponse;
            that.uservote = vote;
            chrome.runtime.sendMessage({'rating': that.rating, 'uservote': that.uservote, 'urlId': that.urlId});
          });
        });
      } else if (this.uservote === vote) { // cancel vote
        request.delete('/urlvote', data, errMsg, (deleteResponse) => {
          that.urlId = deleteResponse;
          request.get(`/urlvote/${that.urlId}`, null, null, errMsg, (getResponse) => {
            that.rating = getResponse;
            that.uservote = null;
            that[vote+'btn'] = '';
            chrome.runtime.sendMessage({'rating': that.rating, 'uservote': that.uservote, 'urlId': that.urlId});
          });
        });
      }
    };

    this.handleSubmitComment = function(comment) {
      if (this.url === null) {
        return;
      }
      var data = {
        url: this.url,
        urlId: this.urlId,
        username: this.currentUser,
        comment: comment,
        title: this.title,
        categories: this.categories
      };
      request.post('/urlcomment', data, 'Could not submit comment: ', (resData) => {
        if(resData) {
          that.urlId = resData;
          chrome.runtime.sendMessage({'rating': that.rating, 'uservote': that.uservote, 'urlId': that.urlId});
        }
        console.log('that.urlId after comment response ', that.urlId);
      });
      this.comment = '';
    };

    this.handleStatsLink = () => {
      let currentUrl = this.url;
      console.log('------currentUrl:', currentUrl);
      let params = {
        currentUrl
      };
      let errMsg = 'failed to get stats page: ';
      request.get('/stats/generate-retrieve', null, params, errMsg, (response) => {
        chrome.tabs.create({
          url: response
        });
        window.close();
      });
    };
  })
  .component('app', {
    templateUrl: '../templates/app.html'
  });
