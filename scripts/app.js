/* global define */
define([
  'jquery'
, 'ramda'
, 'pointfree'
, 'Maybe'
, 'player'
, 'io'
, 'bacon'
, 'http'
], function($, _, P, Maybe, Player, io, bacon, http) {
  'use strict';
  io.extendFn();

  // HELPERS ///////////////////////////////////////////
  var compose = P.compose;
  var map = P.map;
  var log = function(x) { console.log(x); return x; }
  var fork = _.curry(function(f, future) { return future.fork(log, f); })
  var setHtml = _.curry(function(sel, x) { return $(sel).html(x); });
  var listen = _.curry(function (event, target) {
    return bacon.fromEventTarget(target, event);
  });
  var getData = _.curry(function(name, elt) { return $(elt).data(name); });
  var last = function(ar) { return ar[ar.length - 1]; };

  // PURE //////////////////////////////////////////////////
  
var listen = _.curry(function(type, elt) {
  return Bacon.fromEventTarget(elt, type);
});

// getDom :: string -> IO DOM
var getDom = $.toIO();

// appendDom :: string -> HTML -> IO DOM
var appendDom = _.curry(function(sel, elt) {
  return $(sel).append(elt);
});

// appendToResults :: string -> fn
var appendToResults = appendDom('#results');

// eventValue :: DOMEvent -> a
var eventValue = compose(_.get('value'), _.get('target')); 

// termUrl :: string -> URL
var termUrl = s => `https://swapi.co/api/people/?search=${s}`;

// dataToLi :: string -> HTML
var dataToLi = s => $(`<li>${s}</li>`);

// keypressStream :: DOM -> EventStream DOMEvent
var keypressStream = listen('keyup');

// valueStream :: DOM -> EventStream DOMEvent
var valueStream = compose(map(eventValue), keypressStream)

// urlStream :: DOM -> EventStream URL
var urlStream = compose(map(termUrl), valueStream);

// search :: string -> Future Stream
var searchStream = compose(map(http.getJSON), urlStream);

// dataStream :: JSON -> string
var transformData = compose(dataToLi, _.get('name'), _.head, _.get('results'));

// htmlStream :: string -> DOM
var htmlStream = compose(map(map(transformData)), searchStream);

  // IMPURE /////////////////////////////////////////////////////

getDom('#search').map(htmlStream).runIO().onValue(fork(appendToResults));

});
