/*jslint indent: 2, nomen: true, maxlen: 100, white: true  plusplus: true */
/*global beforeEach, afterEach */
/*global describe, it, expect, jasmine */
/*global runs, spyOn, waitsFor, waits */
/*global document, $*/
/*global ContextMenu*/

////////////////////////////////////////////////////////////////////////////////
/// @brief Graph functionality
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2010-2012 triagens GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Michael Hackstein
/// @author Copyright 2011-2013, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

(function() {

  "use strict";

  describe("Context Menu", function() {

    it("should throw an error if no id is given", function() {
      expect(
        function() {
          var t = new ContextMenu();
        }
      ).toThrow("An id has to be given.");
    });

    it("should throw an error if no id is given", function() {
      expect(
        function() {
          var t = new ContextMenu("myId");
        }
      ).not.toThrow();
    });

    describe("set up correctly", function () {

      var id, conMenu, fakeMenu;

      beforeEach(function() {
        id = "myId";
        fakeMenu = {
          target: {},
          show: function(){}
        };
        spyOn($.contextMenu, "create").andReturn(fakeMenu);
        conMenu = new ContextMenu(id);
      });

      it("should create a div in the body", function() {
        var div = document.getElementById(id);
        expect(div).toBeDefined();
        expect(div.parentNode).toEqual(document.body);
        expect(div.tagName.toLowerCase()).toEqual("div");
      });

      it("should be able to bind the context menu", function() {
        var fake = {
          each: function(){}
        };
        spyOn(fake, "each");
        conMenu.bindMenu(fake);
        expect(fake.each).toHaveBeenCalledWith(jasmine.any(Function));
      });

      it("should be able to insert a new entry", function() {
        var call = {
            back: function() {}
          },
          fake = {
            each: function(){}
          },
          entry;
        spyOn(call, "back");
        conMenu.addEntry("MyLabel", call.back);
        // Check if entry is inserted
        entry = document.getElementById(id).firstChild;
        expect(entry).toBeDefined();
        expect(entry.tagName.toLowerCase()).toEqual("ul");
        entry = entry.firstChild;
        expect(entry).toBeDefined();
        expect(entry.tagName.toLowerCase()).toEqual("li");
        entry = entry.firstChild;
        expect(entry).toBeDefined();
        expect(entry.tagName.toLowerCase()).toEqual("button");
        // Check clicks
        conMenu.bindMenu(fake);
        expect(call.back).not.toHaveBeenCalled();
        $(entry).click();
        expect(call.back).toHaveBeenCalled();
      });
    });
  });

}());
