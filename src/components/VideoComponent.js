  /**
 * Helper object that tests videos.
 * @todo - allow this to be exteded more easily.
 */
const AJAX = require('AJAX');
const DOM = require('DOM');
var Language = require('LanguageComponent');

var VideoComponent = {

  /**
   * Iterates over listed video providers and runs their `isVideo` method.
   * @param Element element
   *
   * @return Boolean
   *   Whether the element is a video.
   */
  isVideo: function (element) {
    var isVideo = false;
    for (var name in this.providers) {
      if (this.providers.hasOwnProperty(name)) {
        var provider = this.providers[name];
        if (DOM.is(element, provider.selector) && provider.isVideo(element)) {
          isVideo = true;
        }
      }
    }
    return isVideo;
  },

  findVideos: function (element, callback) {
    for (var name in this.providers) {
      if (this.providers.hasOwnProperty(name)) {
        var provider = this.providers[name];
        DOM.scry(provider.selector, element).forEach(function (video) {
          if (provider.isVideo(video)) {
            provider.hasCaptions(video, callback);
          }
        });
      }
    }
  },

  providers: {

    youTube: {

      selector: 'a, iframe',

      apiUrl: 'http://gdata.youtube.com/feeds/api/videos/?q=%video&caption&v=2&alt=json',

      isVideo: function (element) {
        return (this.getVideoId(element) !== false) ? true : false;
      },

      getVideoId: function (element) {
        var attribute = (DOM.is(element, 'iframe')) ? 'src' : 'href';
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&\?]*).*/;
        var match = DOM.getAttribute(element, attribute).match(regExp);
        if (match && match[7].length === 11) {
          return match[7];
        }
        return false;
      },

      hasCaptions: function (element, callback) {
        var videoId = this.getVideoId(element);
        var request = new AJAX(this.apiUrl.replace('%video', videoId));
        request.then((raw) => {
          var data = JSON.parse(raw);
          callback(element, (data.feed.openSearch$totalResults.$t > 0));
        });
      }
    },

    flash: {

      selector: 'object',

      isVideo: function (element) {
        var isVideo = false;
        if (DOM.scry('param', element).length === 0) {
          return false;
        }
        DOM.scry('param[name=flashvars]', element).forEach(function (element) {
          if (element.getAttribute('value').search(/\.(flv|mp4)/i) > -1) {
            isVideo = true;
          }
        });
        return isVideo;
      },

      hasCaptions: function (element, callback) {
        var hasCaptions = false;
        DOM.scry('param[name=flashvars]', element).forEach(function (element) {
          var val = element.getAttribute('value') || '';
          if (
            (
              val.search('captions') > -1 &&
              val.search('.srt') > -1
            ) ||
            val.search('captions.pluginmode') > -1
          ) {
            hasCaptions = true;
          }
        });
        callback(element, hasCaptions);
      }
    },

    videoElement: {

      selector: 'video',

      isVideo: function (element) {
        return DOM.is(element, 'video');
      },

      hasCaptions: function (element, callback) {
        var $captions = DOM.scry('track[kind=subtitles], track[kind=captions]', element);
        if (!$captions.length) {
          callback(element, false);
          return;
        }
        var language = Language.getDocumentLanguage(element, true);
        var langScope = DOM.parents(element).find((parent) => {
          return DOM.hasAttribute(parent, 'lang');
        })[0];
        if (langScope) {
          language = DOM.getAttribute(langScope, 'lang').split('-')[0];
        }
        $captions.forEach(function (caption) {
          var srclang = caption.getAttribute('srclang');
          if (!srclang || srclang.toLowerCase() === language) {
            let request = new AJAX(DOM.getAttribute(caption, 'src'));
            request.then(
              () => {
                callback(element, true);
              },
              () => {
                callback(element, false);
              }
            );
          }
        });
      }
    }
  }

};

module.exports = VideoComponent;
