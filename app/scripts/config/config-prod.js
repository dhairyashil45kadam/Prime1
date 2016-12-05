'use strict';
angular.module("financeUiApp").constant("APP_CONST", {
  ApiUrl: "http://rivigofinance-prod.ap-southeast-1.elasticbeanstalk.com/",
  loginServiceUrl: 'http://login.rivigo.com',
  loginPagePath: '/sso/login',
  tokenValidPath: '/oauth/check_token',
  tokenRemovePath: '/oauth/revoke/',
  tokenDomain: '.rivigo.com',
  userProfile: 'user',
  client: 'finance-client'
});


