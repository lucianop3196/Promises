"use strict";
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// // TU CÓDIGO AQUÍ:

const $Promise = function (executor) {
  if (typeof executor !== "function") {
    throw new TypeError(/executor.+function/i);
  }
  this._state = "pending";
  this._value = undefined;
  const resolve = function (value) {
    this._internalResolve(value)
  };
  const reject = function (value) {
    this._internalReject(value)
  };
  executor(resolve.bind(this), reject.bind(this));
};

$Promise.prototype._internalReject = function (razon) {
  if (this._state === "pending") {
    this._state = "rejected";
    this._value = razon;
  }
};
$Promise.prototype._internalResolve = function (value) {
  if (this._state === "pending") {
    this._state = "fulfilled";
    return (this._value = value);
  }
};

module.exports = $Promise;
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
