/**
 * Created by Mordekaiser on 27/09/16.
 */
"use strict";
var valora = angular.module('valora', ['ngResource', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'chart.js', 'ngIdle', 'angular-google-analytics']);

valora.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'IdleProvider', 'KeepaliveProvider', 'AnalyticsProvider',
    function ($stateProvider, $locationProvider, $urlRouterProvider, IdleProvider, KeepaliveProvider, AnalyticsProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    AnalyticsProvider.setAccount('');
    AnalyticsProvider.trackPages(true);
    AnalyticsProvider.useAnalytics(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: '/templates/feed/index.html',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('faq', {
            url: '/preguntas-frecuentes',
            templateUrl: '/templates/common/faq.html',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('contact', {
            url: '/contacto',
            templateUrl: '/templates/common/contact.html',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('login', {
            url: '/login',
            templateUrl: '/templates/account/login.html',
            controller: 'LoginCtrl',
            data: {
                authorization: false,
                role: ''
            }
        })
        .state('rewards', {
            url: '/rewards',
            templateUrl: '/templates/rewards/index.html',
            controller: 'RewardsCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('wish-list', {
            url: '/wish-list',
            templateUrl: '/templates/rewards/wish-list.html',
            controller: 'WishListCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('checkout', {
            url: '/checkout',
            templateUrl: '/templates/rewards/checkout.html',
            controller: 'CheckoutCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('account-status', {
            url: '/account-status',
            templateUrl: '/templates/account-status/index.html',
            controller: 'AccountStatusCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('profile', {
            url: '/profile',
            templateUrl: '/templates/account/profile.html',
            controller: 'ProfileCtrl',
            data: {
                authorization: false,
                role: 'colaborator'
            }
        })
        .state('profileImage', {
            url: '/profile-image',
            templateUrl: '/templates/account/profile-img.html',
            controller: 'ProfileImgCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('myBadges', {
            url: '/my-badges',
            templateUrl: '/templates/my-badges/index.html',
            controller: 'MyBadgesCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('myActivity', {
            url: '/my-activity',
            templateUrl: '/templates/my-activity/index.html',
            controller: 'MyActivityCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('myActivityDetails', {
            url: '/my-activity/:_id',
            templateUrl: '/templates/my-activity/details.html',
            controller: 'MyActivityDetailsCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            },
            params: {
                notificationTitle: '',
                _id: ''
            }
        })
        .state('passChange', {
            url: '/password-change',
            templateUrl: '/templates/common/pass-change.html',
            controller: 'PassChangeCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('howItWorks', {
            url: '/how-it-works',
            templateUrl: '/templates/common/how-it-works.html',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('policy', {
            url: '/policy',
            templateUrl: '/templates/policy/policy.html',
            controller: 'PolicyCtrl',
            data: {
                authorization: false,
                role: 'colaborador'
            }
        })
        .state('admin', {
            abstract: true,
            url: '/admin',
            templateUrl: '/templates/admin/index.html'

        })
        .state('admin.banner', {
            url: '/banner',
            templateUrl: '/templates/admin/banner/banner.html',
            controller: 'BannersCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.rewards', {
            url: '/rewards',
            templateUrl: '/templates/admin/rewards/rewards.html',
            controller: 'RewardsAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.editRewards', {
            url: '/rewards/:id',
            templateUrl: '/templates/admin/rewards/edit-reward.html',
            controller: 'EditRewardAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.import', {
            url: '/imports',
            templateUrl: '/templates/admin/imports/index.html',
            controller: 'ImportsAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.import-collaborator', {
            url: '/import-collaborators',
            templateUrl: '/templates/admin/imports/add-collaborators.html',
            controller: 'AddCollaboratorsCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.delete-collaborator', {
            url: '/delete-collaborators',
            templateUrl: '/templates/admin/imports/delete-collaborators.html',
            controller: 'DeleteCollaboratorsCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.badges', {
            url: '/badges',
            templateUrl: '/templates/admin/badges/index.html',
            controller: 'BadgesAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.edit-badges', {
            url: '/badges/:id',
            templateUrl: '/templates/admin/badges/edit-badge.html',
            controller: 'EditBadgeAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.specialBadges', {
            url: '/special-badges',
            templateUrl: '/templates/admin/badges/special-badge.html',
            controller: 'SpecialBadgesAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.gpBadges', {
            url: '/gp-badges',
            templateUrl: '/templates/admin/badges/gp-badge.html',
            controller: 'gpBadgeAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.editGPBadges', {
            url: '/gp-badges/:id',
            templateUrl: '/templates/admin/badges/edit-gp-badge.html',
            controller: 'EditGPBadgeCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.editSpecialBadges', {
            url: '/special-badges/:id',
            templateUrl: '/templates/admin/badges/special-badge-edit.html',
            controller: 'SpecialBadgesEditAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.acknowledgmentGP', {
            url: '/acknowledgment-gp',
            templateUrl: '/templates/admin/badges/acknowledgment-gp.html',
            controller: 'AcknowledgmentGPAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.account', {
            url: '/account',
            templateUrl: '/templates/admin/account/index.html',
            controller: 'AdminAccountCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.account-location', {
            url: '/account-byLocation',
            templateUrl: '/templates/admin/account/status-location.html',
            controller: 'AdminAccountStatusLocationCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['admin']
            }
        })
        .state('admin.account-status', {
            url: '/account-status/:id',
            templateUrl: '/templates/admin/account/status.html',
            controller: 'AdminAccountStatusCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin', 'admin']
            }
        })
        .state('admin.tempPoints', {
            url: '/temporal-points',
            templateUrl: '/templates/admin/imports/temporal-points.html',
            controller: 'TempPointsAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.roles', {
            url: '/roles',
            templateUrl: '/templates/admin/roles/index.html',
            controller: 'RoleAdminCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.feeds', {
            url: '/feeds',
            templateUrl: '/templates/admin/feeds/index.html',
            controller: 'FeedsCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.badges-group', {
            url: '/badges-group',
            templateUrl: '/templates/admin/reports/badge-groups-points.html',
            controller: 'badgeGroupsPointsCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin', 'admin']
            }
        })
        .state('admin.badgeAcknowledgments', {
            url: '/badge-acknowledgments',
            templateUrl: '/templates/admin/reports/badge-acknowledgments.html',
            controller: 'badgeAcknowledgmentsCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin', 'admin']
            }
        })
        .state('admin.history-points', {
            url: '/history-points',
            templateUrl: '/templates/admin/reports/history-points.html',
            controller: 'historyPointsCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin', 'admin']
            }
        })
        .state('admin.users-log-report', {
            url: '/users-log-report',
            templateUrl: '/templates/admin/reports/user-logs.html',
            controller: 'UserLogsReportCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin', 'admin']
            }
        })
        .state('admin.users-general-report', {
            url: '/users-general-report',
            templateUrl: '/templates/admin/reports/users-general.html',
            controller: 'UserGeneralReportCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.intelexion-logs', {
            url: '/intelexion-logs',
            templateUrl: '/templates/admin/reports/intelexion-web-service-log.html',
            controller: 'IWebServiceLogCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.mention', {
            url: '/mention',
            templateUrl: '/templates/admin/mentions/mention-list.html',
            controller: 'AdminMentionListCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.mentionEdit', {
            url: '/mention/:id',
            templateUrl: '/templates/admin/mentions/mention-edit.html',
            controller: 'AdminMentionEditCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.feedMessageList', {
            url: '/feed-message',
            templateUrl: '/templates/admin/feedMessage/feed-message-list.html',
            controller: 'AdminFeedMessageListCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.activeCollaborators', {
            url: '/active-collaborators',
            templateUrl: '/templates/admin/reports/active-collaborators.html',
            controller: 'ActiveCollaboratorsCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin', 'admin']
            }
        })
        .state('admin.exchangedRewards', {
            url: '/exchanged-rewards',
            templateUrl: '/templates/admin/reports/exchanged-rewards.html',
            controller: 'ExchangedRewardsCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.temporal-pass', {
            url: '/temporal-pass',
            templateUrl: '/templates/admin/account/temporal-pass.html',
            controller: 'TemporalPassCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
        .state('admin.dashboard', {
            url: '/dashboard',
            templateUrl: '/templates/admin/dashboard/dashboard.html',
            controller: 'DashboardCtrl',
            data: {
                authorization: true,
                redirectTo: 'home',
                role: ['superAdmin']
            }
        })
      .state('training', {
          abstract: true,
          url: '/training',
          templateUrl: '/templates/training/index.html'
      })
      .state('training.course', {
          url: '/course',
          templateUrl: '/templates/training/course/index.html',
          controller: 'CourseListCtrl',
          data: {
              authorization: false,
              role: 'colaborador'
          }
      })
      .state('training.course-detail', {
          url: '/course/:slug',
          templateUrl: '/templates/training/course/detail.html',
          controller: 'CourseDetailCtrl',
          data: {
              authorization: false,
              role: 'colaborador'
          }
      })
      .state('training.evaluations', {
          url: '/evaluations',
          templateUrl: '/templates/training/evaluation/index.html',
          controller: 'EvaluationCtrl',
          data: {
              authorization: false,
              role: 'colaborador'
          }
      })
      .state('training.history', {
          url: '/history',
          templateUrl: '/templates/training/history/index.html',
          controller: 'HistoryCtrl',
          data: {
              authorization: false,
              role: 'colaborador'
          }
      })
      .state('training.careers', {
          url: '/careers',
          templateUrl: '/templates/training/careers/index.html',
          controller: 'CareersCtrl',
          data: {
              authorization: false,
              role: 'colaborador'
          }
      })
      .state('training.material', {
          url: '/material',
          templateUrl: '/templates/training/material/index.html',
          controller: 'MaterialCtrl',
          data: {
              authorization: false,
              role: 'colaborador'
          }
      })

    IdleProvider.idle(1200);
    IdleProvider.timeout(60);
    KeepaliveProvider.interval(2);
}]);

valora.run(function ($rootScope, $state, $log, AuthToken, $location, mvNotifier, Idle, Analytics) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
        // after users login, start the idle watch
        if(toState.url == "/")
            Idle.watch();
        $rootScope.toState = toState;
        $rootScope.toStateParams = toStateParams;
        if (!AuthToken.isAuthenticated()) {
            $location.path('/login');
            $log.debug('Not auth');
        }
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        var user = AuthToken.getToken();
        var auth = false;
        if(user) {
            angular.forEach(user.roles, function (role, key) {
                if(toState.data.role.indexOf(role) !== -1)
                    auth = true;
            });
            if (auth == false && toState.data.authorization) {
                $state.go('home');
            }
        }
    });
    $rootScope.$on('IdleStart', function() {
        mvNotifier.error('Has permanecido ausente durante 20 minutos, si no se detecta movimiento se cerrará la sesión. Esperando 60 segundos.');
    });
    $rootScope.$on('IdleTimeout', function() {
        mvNotifier.error('Cerrando sesión por inactividad');
        AuthToken.removeToken();
        $state.go('login');
    });
});