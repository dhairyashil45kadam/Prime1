'use strict';
angular.module("financeUiApp").constant("APP_CONST", {
	ApiUrl: "http://rivigofinance-stg.ap-southeast-1.elasticbeanstalk.com/",
  	loginServiceUrl: 'http://login.stg.rivigo.com',
  loginPagePath: '/sso/login',
  tokenValidPath: '/oauth/check_token',
  tokenRemovePath: '/oauth/revoke/',
  tokenDomain: '.stg.rivigo.com',
  userProfile: 'user',
  client: 'finance-stg-client'
});
