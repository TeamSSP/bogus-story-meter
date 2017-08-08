angular.module('app', [])

  .controller('AppCtrl', function($scope, request) {

    let that = this;

    this.rating = null;
    this.urlId = null;
    this.currentUser = null;
    this.uservote = null;
    this.url = null;
    this.fullName = null;
    this.profilePicture = null;
    this.upvotebtn = '';
    this.downvotebtn = '';

    chrome.identity.getAuthToken({ 'interactive': true }, (token) => {
    // Use the token.
      if (token) {
        $scope.$apply();
      }
    });

    chrome.runtime.sendMessage({msg: 'Give me data on this tab'});

    chrome.extension.onMessage.addListener((urlObj) => {
      that.rating = urlObj.rating;
      that.urlId = urlObj.urlId;
      that.url = urlObj.tabUrl;
      that.currentUser = urlObj.username;
      that.uservote = urlObj.uservote;
      that.name = urlObj.name;
      that.profilePicture = urlObj.profilepicture;
      if (that.uservote) {
        that[that.uservote+'btn'] = 'pressed';
      }
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
      let data = {
        urlId: this.urlId,
        url: this.url,
        username: this.currentUser,
        type: vote
      };

      let errMsg = 'Could not submit vote: ';

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

    this.handleSubmitComment = (comment) => {
      if (this.url === null || !comment.length) {
        return;
      }

      let data = {
        url: this.url,
        urlId: this.urlId,
        username: this.currentUser,
        comment: comment
      };
      request.post('/urlcomment', data, 'Could not submit comment: ', (resData) => {
        if (resData) {
          that.urlId = resData;
          chrome.runtime.sendMessage({'rating': that.rating, 'uservote': that.uservote, 'urlId': that.urlId});
        }
      });
      this.comment = '';
    };

    this.handleStatsLink = () => {
      let currentUrl = this.url;
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
