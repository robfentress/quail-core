  /**
 * Helper object that tests videos.
 * @todo - allow this to be exteded more easily.
 */
var Language = require('LanguageComponent');

var VideoComponent = {

  /**
   * Iterates over listed video providers and runs their `isVideo` method.
   * @param jQuery $element
   *   An element in a jQuery wrapper.
   *
   * @return Boolean
   *   Whether the element is a video.
   */
  isVideo: function (element) {
    var isVideo = false;
    $.each(this.providers, function () {
      if (element.is(this.selector) && this.isVideo(element)) {
        isVideo = true;
      }
    });
    return isVideo;
  },

  findVideos: function (element, callback) {
    $.each(this.providers, function (name, provider) {
      DOM.scry(this.selector, element).each(function () {
        var video = $(this);
        if (provider.isVideo(video)) {
          provider.hasCaptions(video, callback);
        }
      });
    });
  },

  providers: {

    youTube: {

      selector: 'a, iframe',

      apiUrl: 'http://gdata.youtube.com/feeds/api/videos/?q=%video&caption&v=2&alt=json',

      isVideo: function (element) {
        return (this.getVideoId(element) !== false) ? true : false;
      },

      getVideoId: function (element) {
        var attribute = (element.is('iframe')) ? 'src' : 'href';
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&\?]*).*/;
        var match = element.attr(attribute).match(regExp);
        if (match && match[7].length === 11) {
          return match[7];
        }
        return false;
      },

      hasCaptions: function (element, callback) {
        var videoId = this.getVideoId(element);
        $.ajax({
          url: this.apiUrl.replace('%video', videoId),
          async: false,
          dataType: 'json',
          success: function (data) {
            callback(element, (data.feed.openSearch$totalResults.$t > 0));
          }
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
        DOM.scry('param[name=flashvars]', element).each(function () {
          if ($(this).attr('value').search(/\.(flv|mp4)/i) > -1) {
            isVideo = true;
          }
        });
        return isVideo;
      },

      hasCaptions: function (element, callback) {
        var hasCaptions = false;
        DOM.scry('param[name=flashvars]', element).each(function () {
          if (($(this).attr('value').search('captions') > -1 &&
             $(this).attr('value').search('.srt') > -1) ||
             $(this).attr('value').search('captions.pluginmode') > -1) {
            hasCaptions = true;
          }
        });
        callback(element, hasCaptions);
      }
    },

    videoElement: {

      selector: 'video',

      isVideo: function (element) {
        return element.is('video');
      },

      hasCaptions: function (element, callback) {
        var $captions = DOM.scry('track[kind=subtitles], track[kind=captions]', element);
        if (!$captions.length) {
          callback(element, false);
          return;
        }
        var language = Language.getDocumentLanguage(element, true);
        if (element.parents('[lang]').length) {
          language = element.parents('[lang]').first().attr('lang').split('-')[0];
        }
        var foundLanguage = false;
        $captions.each(function () {
          if (!$(this).attr('srclang') || $(this).attr('srclang').toLowerCase() === language) {
            foundLanguage = true;
            try {
              var request = $.ajax({
                url: $(this).attr('src'),
                type: 'HEAD',
                async: false,
                error: function () {}
              });
              if (request.status === 404) {
                foundLanguage = false;
              }
            }
            catch (e) {
              null;
            }
          }
        });
        if (!foundLanguage) {
          callback(element, false);
          return;
        }
        callback(element, true);
      }
    }
  }

};

module.exports = VideoComponent;
