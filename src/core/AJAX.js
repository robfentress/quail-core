const Q = require('q');

class AJAX {
  constructor (url, type) {

    let contentType = this._resolveContentType(type);

    return Q.Promise((resolve, reject, notify) => {
      var request = new XMLHttpRequest();

      function onReadyStateChange () {
        if (
          type === 'HEAD' &&
          request.readyState === 2
        ) {
          resolve(request.getAllResponseHeaders());
        }
        else if (request.readyState === 4) {
          if ([200, 301, 302].indexOf(request.status) > -1) {
            resolve(request.responseText);
          }
          else {
            reject('Request failed: ' + request.status);
          }
        }
      }

      function onError () {
        reject(
          'AJAX request to \'' + url + '\' failed: ' + JSON.stringify(url)
        );
      }

      function onProgress (event) {
        notify(event.loaded / event.total);
      }

      request.open('GET', url, true);
      request.setRequestHeader('Content-Type', contentType);
      request.onreadystatechange = onReadyStateChange;
      request.onerror = onError;
      request.onprogress = onProgress;
      request.send();
    });
  }
  _resolveContentType (name) {
    let type;
    switch (name) {
    case 'json':
      type = 'application/json';
      break;
    default:
      type = 'text/html';
    }
    return type;
  }
}

module.exports = AJAX;
