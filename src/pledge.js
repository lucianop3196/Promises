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
$Promise.prototype._internalReject = function (reason) {
  if (this._state === "pending") {
    this._state = "rejected";
    this._value = reason;
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

//Función que resuelve los handlers y nuevas promesas acumulados en la cola (_handleGroup) siempre con el mismo this._value, ya que los then no estan encadenados
$Promise.prototype._callHandlers = function () {
  while (this._handlerGroups.length > 0) {
    let current = this._handlerGroups.shift();
    if (this._state === "fulfilled") {
      if (!current.successCb) {
        current.downstreamPromise._internalResolve(this._value);
      } else {
        try {
          const result = current.successCb(this._value);
          if (result instanceof $Promise) {
            result.then(
              (value) => current.downstreamPromise._internalResolve(value),
              (err) => current.downstreamPromise._internalReject(err)
            );
          } else {
            current.downstreamPromise._internalResolve(result);
          }
        } catch (e) {
          current.downstreamPromise._internalReject(e);
        }
      }
    } else if (this._state === "rejected") {
      if (!current.errorCb) {
        current.downstreamPromise._internalReject(this._value);
      } else {
        try {
          const result = current.errorCb(this._value);
          if (result instanceof $Promise) {
            result.then(
              (value) => current.downstreamPromise._internalResolve(value),
              (err) => current.downstreamPromise._internalReject(err)
            );
          } else {
            current.downstreamPromise._internalResolve(result);
          }
        } catch (e) {
          current.downstreamPromise._internalReject(e);
        }
      }
    }
  }
};

//El metodo then me almacena los success, error handlers y nuevas promesas en una cola llamda _handleGroup
$Promise.prototype.then = function (successCb, errorCb) {
  const handlerGroup = {};
  if (typeof successCb !== "function") successCb = false;
  if (typeof errorCb !== "function") errorCb = false;
  handlerGroup.successCb = successCb;
  handlerGroup.errorCb = errorCb;
  handlerGroup.downstreamPromise = new $Promise(function () {});
  this._handlerGroups.push(handlerGroup);
  //Si la promesa fue resuelta y se ejecuta el metodo then posteriormente, aquí se ejecuta el callhandlers.
  if (this._state !== "pending") this._callHandlers();
  return handlerGroup.downstreamPromise;
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
