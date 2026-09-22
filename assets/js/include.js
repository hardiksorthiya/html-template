(function () {
  var INCLUDE_CACHE = '16';

  function loadFile(path) {
    var url = path + (path.indexOf('?') >= 0 ? '&' : '?') + 'cb=' + INCLUDE_CACHE;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    try {
      xhr.overrideMimeType('text/html; charset=utf-8');
      xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      xhr.setRequestHeader('Pragma', 'no-cache');
    } catch (err) {}
    xhr.send();

    if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 0 && xhr.responseText)) {
      return xhr.responseText;
    }

    console.error('Could not load ' + path);
    return '';
  }

  function includeHead() {
    var html = loadFile('component/head.html');
    if (html) {
      document.head.insertAdjacentHTML('beforeend', html);
    }
  }

  function includeHTML() {
    var nodes = document.querySelectorAll('[data-include]');

    Array.prototype.forEach.call(nodes, function (el) {
      var path = el.getAttribute('data-include');
      var html = loadFile(path);

      if (html) {
        el.outerHTML = html;
      }
    });
  }

  if (document.head) {
    includeHead();
  }

  window.includeHTML = includeHTML;
})();
