/**
 * Created by Mordekaiser on 27/09/16.
 */
"use strict";
angular.module('valora').value('mvToastr', toastr);

angular.module('valora').factory('mvNotifier', function (mvToastr) {
    return {
        notify: function (msg) {
            mvToastr.success(msg);
        },
        error: function (msg) {
            mvToastr.error(msg);
        }
    }
});