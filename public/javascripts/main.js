'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 */
angular
  .module('sbAdminApp', [
    'oc.lazyLoad',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'ngCookies',
    'btford.socket-io',
    'ngMap',
    'flow',
    'ngTagsInput',
    'ngFlash',
    'ngAnimate',
    'toaster',
    'naif.base64',
    'angularFileUpload',
    'chart.js',
    'LocalStorageModule'
  ]).run(function($rootScope, $state, $cookies, Authentication){

        $rootScope.$on('$stateChangeStart', function(ev, toState, toParams, fromState, fromParams){

            Authentication.authentication();

            if(toState.module == 'register' && $rootScope.authentication){
                ev.preventDefault();

                $state.reload(fromState.name);
            }
            else if(toState.module == 'private' && !$rootScope.authentication){
                ev.preventDefault();

                $state.reload(fromState.name);
            }
        });
    })
  .config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider','$sceProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider,$sceProvider) {

    $sceProvider.enabled(false);

    $ocLazyLoadProvider.config({
      debug:false,
      events:true,
    });

    $urlRouterProvider.otherwise('/dashboard/home');

    $stateProvider
      .state('dashboard', {
        module: 'public',
        url:'/dashboard',
        templateUrl: 'views/views/dashboard/main.html',
        resolve: {
            loadMyDirectives:function($ocLazyLoad){
                return $ocLazyLoad.load(
                {
                    name:'sbAdminApp',
                    files:[
                    'javascripts/directives/header/header.js',
                    'javascripts/directives/header/header-notification/header-notification.js',
                    'javascripts/directives/sidebar/sidebar.js',
                    'javascripts/directives/sidebar/sidebar-search/sidebar-search.js'
                    ]
                }),
                $ocLazyLoad.load(
                {
                   name:'toggle-switch',
                   files:["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                          "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                      ]
                }),
                $ocLazyLoad.load(
                {
                  name:'ngAnimate',
                  files:['bower_components/angular-animate/angular-animate.js']
                }),
                $ocLazyLoad.load(
                {
                  name:'ngCookies',
                  files:['bower_components/angular-cookies/angular-cookies.js']
                }),
                $ocLazyLoad.load(
                {
                  name:'ngResource',
                  files:['bower_components/angular-resource/angular-resource.js']
                }),
                $ocLazyLoad.load(
                {
                  name:'ngSanitize',
                  files:['bower_components/angular-sanitize/angular-sanitize.js']
                }),
                $ocLazyLoad.load(
                {
                  name:'ngTouch',
                  files:['bower_components/angular-touch/angular-touch.js']
                })
            }
        }
    })
      .state('dashboard.home',{
        module: 'public',
        url:'/home',
        controller: 'homeController',
        templateUrl:'views/views/pages/home.html',
        resolve: {
          loadMyFiles:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'sbAdminApp',
              files:[
              'javascripts/controllers/home.controller.js',
              'javascripts/directives/timeline/timeline.js',
              'javascripts/directives/notifications/notifications.js',
              'javascripts/directives/chat/chat.js',
              'javascripts/directives/dashboard/stats/stats.js',
              'javascripts/directives/dashboard/dstats/dstats.js',
              'javascripts/Service/project.service.js'
              ]
            })
          }
            //loadMyDirectives: function($ocLazyLoad){
            //    return $ocLazyLoad.load({
            //        name: 'sbAdminApp',
            //        files: [
            //            'javascripts/directives/timeline/timeline.js',
            //            'javascripts/directives/notifications/notifications.js',
            //            'javascripts/directives/chat/chat.js',
            //            'javascripts/directives/dashboard/stats/stats.js'
            //        ]
            //    })
            //}
        }
      })
      .state('dashboard.form',{
        templateUrl:'views/views/form.html',
        url:'/form',
        module: 'private'
    })
      .state('dashboard.createaccount',{
        templateUrl:'views/views/pages/create_account.html',
        url:'/createaccount',
        module: 'register',
        controller: 'createAcctController',
        resolve: {
            loadMyCntrl: function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'sbAdminApp',
                    files: ['javascripts/controllers/account.controller.js']
                });
            }
        }
    })
      .state('dashboard.editprofile',{
        templateUrl:'views/views/pages/edit_org.html',
        url:'/editorgprofile',
        module: 'private',
        controller: 'editProfileController',
        resolve: {
            loadMyFiles: function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'sbAdminApp',
                    files: ['javascripts/controllers/account.controller.js',
                        'javascripts/Service/account.service.js'
                    ]
                });
            }
        }
    })
      .state('dashboard.accountsettings',{
        templateUrl:'views/views/pages/account_settings.html',
        url:'/accountsettings',
        module: 'private',
        controller: 'accountSettingsController',
        resolve: {
            loadMyFiles: function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'sbAdminApp',
                    files: ['javascripts/controllers/account.controller.js',
                        'javascripts/Service/account.service.js'
                    ]
                });
            }
        }
    })
      .state('dashboard.createproject',{
        templateUrl:'views/views/pages/edit_project_v2.html',
        url:'/createproject',
        module: 'private',
        controller: 'createProjectController',
        resolve: {
            loadMyFiles: function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'sbAdminApp',
                    files: ['javascripts/Service/project.service.js',
                        'javascripts/controllers/project.controller.js',
                        'javascripts/Service/account.service.js'
                    ]
                });
            }
        }
    })
      .state('dashboard.orgprofile',{
        templateUrl:'views/views/pages/org_profile.html',
        url:'/orgprofile',
        module: 'public',
        controller: 'organizationProfileController',
        resolve: {
            loadMyFiles : function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'sbAdminApp',
                    files: ['javascripts/Service/account.service.js',
                    'javascripts/controllers/profile.controller.js'
                    ]
                })
            }
        }
    })
        .state('dashboard.projectprofile',{
            templateUrl:'views/views/pages/proj_profile.html',
            url:'/projprofile',
            module: 'public',
            controller: 'projectProfileController',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/controllers/profile.controller.js',
                            'javascripts/controllers/account.controller.js',
                            'javascripts/Service/project.service.js'
                        ]
                    });
                }
            }
        })
      .state('dashboard.editproject',{
        templateUrl:'views/views/pages/edit_project_v2.html',
        url:'/editproject',
        module: 'private',
        controller: 'editProjectController',
        resolve: {
            loadMyFiles: function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'sbAdminApp',
                    files: ['javascripts/controllers/project.controller.js',
                        'javascripts/Service/project.service.js',
                        'javascripts/Service/account.service.js'
                    ]
                });
            }
        }
    })
        /*TEMPORARY--FOR VIEWING PURPOSES*/
        .state('dashboard.projectsummary',{
            templateUrl:'views/views/pages/project_summary.html',
            url:'/projectsummary',
            module: 'private',
            controller: 'projectSummaryController',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/controllers/project.controller.js',
                            'javascripts/Service/project.service.js',
                            'javascripts/Service/account.service.js'
                        ]
                    });
                }
            }
        })
        /*TEMPORARY--FOR VIEWING PURPOSES*/
        .state('dashboard.projectlist',{
            templateUrl:'views/views/pages/project_list.html',
            url:'/projectlist',
            module: 'private',
            controller: 'projectListController',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/controllers/project.controller.js',
                            'javascripts/Service/project.service.js',
                            'javascripts/Service/account.service.js'
                        ]
                    });
                }
            }
        })

        /*TEMPORARY -- for viewing purposes lang*/
        .state('dashboard.createprojsummary',{
            templateUrl:'views/views/pages/create_proj_summary.html',
            url:'/createprojsummary',
            module: 'private',
            controller: 'createProjectSummaryController',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/controllers/project.controller.js',
                            'javascripts/Service/project.service.js',
                            'javascripts/Service/account.service.js'
                        ]
                    });
                }
            }

        })
        /*TEMPORARY -- for viewing purposes lang*/
        .state('dashboard.credits',{
            templateUrl:'views/views/pages/credits.html',
            url:'/credits',
            module: 'public',
            controller: '',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/controllers/project.controller.js',
                            'javascripts/Service/project.service.js',
                            'javascripts/Service/account.service.js'
                        ]
                    });
                }
            }

        })
        /*TEMPORARY -- for viewing purposes lang*/
        .state('dashboard.faqs',{
            templateUrl:'views/views/pages/faqs.html',
            url:'/faqs',
            module: 'public',
            controller: '',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/controllers/project.controller.js',
                            'javascripts/Service/project.service.js',
                            'javascripts/Service/account.service.js'
                        ]
                    });
                }
            }

        })
        /*TEMPORARY -- for viewing purposes lang*/
        .state('dashboard.summaryreport',{
            templateUrl:'views/views/pages/summary_report.html',
            url:'/summaryreport',
            module: 'private',
            controller: 'allSummaryReport',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/controllers/report.controller.js',
                            'javascripts/Service/project.service.js',
                            'javascripts/Service/account.service.js'
                        ]
                    });
                }
            }

        })
        ///*TEMPORARY -- for viewing purposes lang*/
        //.state('dashboard.performanceevaluation',{
        //    templateUrl:'views/views/pages/perf_evaluation.html',
        //    url:'/perfevaluation',
        //    module: 'private',
        //    controller: 'createProjectSummaryController',
        //    resolve: {
        //        loadMyFiles: function($ocLazyLoad){
        //            return $ocLazyLoad.load({
        //                name: 'sbAdminApp',
        //                files: ['javascripts/controllers/project.controller.js',
        //                    'javascripts/Service/project.service.js',
        //                    'javascripts/Service/account.service.js'
        //                ]
        //            });
        //        }
        //    }
        //
        //})
        /*FOR VIEWING PURPOSES*/
        .state('dashboard.inbox',{
            templateUrl:'views/views/pages/inbox.html',
            url:'/inbox',
            module: 'private',
            controller: 'messageProfileController',
            resolve: {
                loadMyFiles : function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/Service/account.service.js',
                            'javascripts/directives/chat/chat.js',
                            'javascripts/controllers/profile.controller.js'
                        ]
                    })
                }
            }
        })
        .state('dashboard.performanceReview',{
            templateUrl:'views/views/pages/perf_evaluation.html',
            url:'/performancereview',
            module: 'private',
            controller: 'createPerformanceReport',
            resolve: {
                loadMyFiles : function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/Service/account.service.js',
                            'javascripts/controllers/project.controller.js',
                            'javascripts/controllers/report.controller.js'
                        ]
                    })
                }
            }
        })
        .state('dashboard.performanceStatistics',{
            templateUrl:'views/views/pages/perf_stat.html',
            url:'/performancestatistics',
            module: 'private',
            controller: 'performanceReport',
            resolve: {
                loadMyFiles : function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'sbAdminApp',
                        files: ['javascripts/Service/account.service.js',
                            'javascripts/controllers/project.controller.js',
                            'javascripts/controllers/report.controller.js'
                        ]
                    })
                }
            }
        })
        .state('dashboard.projectstatus',{
            templateUrl:'views/views/pages/project_status.html',
            url:'/projectstatus',
            module: 'private',
            controller: 'statisticalReport',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'chart.js',
                        files: [
                            'javascripts/controllers/report.controller.js'/*,
                             'bower_components/angular-chart.js/dist/angular-chart.min.js',
                             'bower_components/angular-chart.js/dist/angular-chart.css'*/
                        ]
                    });
                }
            }

        })
        .state('dashboard.resourcestat',{
            templateUrl:'views/views/pages/resources_stat.html',
            url:'/resourcestat',
            module: 'private',
            controller: 'resourceStatistics',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'chart.js',
                        files: [
                            'javascripts/controllers/report.controller.js'/*,
                             'bower_components/angular-chart.js/dist/angular-chart.min.js',
                             'bower_components/angular-chart.js/dist/angular-chart.css'*/
                        ]
                    });
                }
            }

        })
        .state('dashboard.frequencyreport',{
            templateUrl:'views/views/pages/frequency_report.html',
            url:'/frequencyreport',
            module: 'private',
            controller: 'sectorFrequencyController',
            resolve: {
                loadMyFiles: function($ocLazyLoad){
                    return $ocLazyLoad.load({
                        name: 'chart.js',
                        files: [
                            'javascripts/controllers/report.controller.js'/*,
                             'bower_components/angular-chart.js/dist/angular-chart.min.js',
                             'bower_components/angular-chart.js/dist/angular-chart.css'*/
                        ]
                    });
                }
            }

        });

  }]);

//angular.module('sbAdminApp').run(function($rootScope, $location){
//    var routesThatDontRequireAuth = ['/dashboard/home'];
//
//    var routeClean = function(route){
//        return _.find(routesThatDontRequireAuth, function(noAuthRoute){
//            return _.str.startsWith(route, noAuthRoute);
//        });
//    };
//
//    $rootScope.$on('$stateChangeStart', function(ev, to, toParams, from, fromParams){
//        if(!routeClean($location.url()) && !$rootScope.authentication){
//            $location.path('/');
//        }
//    })
//})
    
