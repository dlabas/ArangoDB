/*jslint indent: 2, nomen: true, maxlen: 100, white: true  plusplus: true, browser: true*/
/*global describe, beforeEach, afterEach, it, */
/*global spyOn, expect*/
/*global templateEngine*/
(function() {
  "use strict";

  describe("Cluster Dashboard View", function() {
    var view, div, overview;

    beforeEach(function() {
      div = document.createElement("div");
      div.id = "content"; 
      document.body.appendChild(div);
      overview = {
        render: function(){}
      };
      spyOn(window, "ClusterOverviewView").andReturn(overview);
    });

    afterEach(function() {
      document.body.removeChild(div);
    });

    describe("rendering", function() {
      var info;

      beforeEach(function() {
        spyOn(overview, "render");
        view = new window.ClusterDashboardView();
      });

      it("should create a Cluster Overview View", function() {
        expect(window.ClusterOverviewView).not.toHaveBeenCalled();
        window.ClusterOverviewView.reset();
        view.render();
        expect(window.ClusterOverviewView).toHaveBeenCalled();
        window.ClusterOverviewView.reset();
        view.render();
        expect(window.ClusterOverviewView).toHaveBeenCalled();
      });

      it("should render the Cluster Overview", function() {
        view.render();
        expect(overview.render).toHaveBeenCalled();
      });
    });

  });

}());