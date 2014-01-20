/*jslint indent: 2, nomen: true, maxlen: 100, white: true, plusplus: true */
/*global window, Backbone */
(function() {
  "use strict";
  window.ClusterDatabases = Backbone.Collection.extend({
    model: window.ClusterDatabase,
    
    url: "/_admin/aardvark/cluster/Databases",

    getList: function() {
      return [
        {
          name: "_system",
          status: "ok"
        },
        {
          name: "myDatabase",
          status: "warning"
        },
        {
          name: "otherDatabase",
          status: "critical"
        }
      ];
    }

  });
}());

