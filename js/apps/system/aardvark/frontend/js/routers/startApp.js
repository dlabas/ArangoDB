/*jslint indent: 2, nomen: true, maxlen: 100, white: true, */
/*global window, $, Backbone, document */ 

(function() {
  "use strict";

  $(document).ready(function() {
    window.App = new window.Router();
    Backbone.history.start();
    window.App.handleResize();
  });

}());
