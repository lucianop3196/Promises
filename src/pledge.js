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
  this._handlerGroups = [];

  const resolve = function (value) {
    this._internalResolve(value);
  };
  const reject = function (value) {
    this._internalReject(value);
  };
  executor(resolve.bind(this), reject.bind(this));
};

//Función que rechaza la promesa original y llama a ._callHandlers() para resolver los then.
$Promise.prototype._internalReject = function (razon) {
  if (this._state === "pending") {
    this._state = "rejected";
    this._value = razon;
    this._callHandlers();
  }
};

//Función que resuelve la promesa original y llama a ._callHandlers() para resolver los then.
$Promise.prototype._internalResolve = function (value) {
  if (this._state === "pending") {
    this._state = "fulfilled";
    this._value = value;
    this._callHandlers();
  }
};

//Función que resuelve los handlers acumulados en la cola (_handleGroup) siempre con el mismo this._value, ya que los then no estan encadenados
$Promise.prototype._callHandlers = function () {
  while (this._handlerGroups.length > 0) {
    let current = this._handlerGroups.shift();
    if (this._state === "fulfilled") {
      current.successCb && current.successCb(this._value);
    } else if (this._state === "rejected") {
      current.errorCb && current.errorCb(this._value);
    }
  }
};

//El metodo then me almacena los success y error handlers en una cola llamda _handleGroup
$Promise.prototype.then = function (successCb, errorCb) {
  const handlerGroup = {};
  if (typeof successCb !== "function") successCb = false;
  if (typeof errorCb !== "function") errorCb = false;
  handlerGroup.successCb = successCb;
  handlerGroup.errorCb = errorCb;
  this._handlerGroups.push(handlerGroup);
  //Si la promesa fue resuelta y se ejecuta el metodo then posteriormente, aquí se ejecuta el callhandlers.
  if (this._state !== "pending") this._callHandlers();
};

$Promise.prototype.catch = function (errorCb) {
  return this.then(null, errorCb);
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
