addKiller("SKCommsVideo", {
  "canKill": function(data) {
    var match = /(dbi\.video\.cyworld|v\.nate|v\.egloos)\.com/.exec(data.src);
    if (match) {
      return true;
    } else return false;
  },

  "process": function(data, callback) {
    var flashvars = parseFlashVariables(data.params.flashvars);
    var mov_id = flashvars.mov_id, v_key = flashvars.v_key;
    // nate video
    if (mov_id) {
      if (v_key) {
        this.processNateVideoXml(mov_id, v_key, callback);
      } else {
        this.processNateVideoID(mov_id, callback);
      }
    // embedded video player (egloos, cyworld, etc.)
    } else {
      var blogid, serial;
      var match = data.src.replace(/\|/g, "%7C").match(/\/(0|[a-z]\d+)%7C(\d+)\/(\d+)/ig);
      if (match) {
        blogid = match[1];
        serial = match[2];
        mov_id = match[3];
        if (blogid && serial) {
          this.processEgloosVideoID(mov_id, blogid, serial, callback);
        } else {
          this.processNateVideoID(mov_id, callback);
        }
      }
    }
  },

  // flash video via Nate video
  "processNateVideoXml": function(mov_id, v_key, callback) {
    var url = "http://v.nate.com/movie_url.php?mov_id=" + mov_id + "&v_key=" + v_key + "&type=xml";
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function(event) {
      var result = event.target.responseXML.getElementsByTagName("movie")[0];
      var siteinfo = [];

      var title = result.getElementsByTagName("title")[0].textContent;
      var org_url = result.getElementsByTagName("org_url")[0].textContent;
      var org_name = "Nate";
      var mov_url = result.getElementsByTagName("mov_urls")[0].getElementsByTagName("url")[0].textContent;
      var thumb_url = result.getElementsByTagName("master_thumbnail")[0].getElementsByTagName("url")[0].textContent;

      callback({
        "playlist": [{
          "title": title,
          "poster": thumb_url,
          "siteinfo": [{
            "name": org_name,
            "url": org_url
          }],
          "sources": [{
            "url": mov_url,
            "format": extractExt(mov_url).toUpperCase(),
            "isNative": true
          }]
        }]
      });
    };
    xhr.send(null);
  },

  // mobile video via Nate
  "processNateVideoID": function(videoid, callback) {
    callback({
      "playlist": [{
        "sources": [{
          "url": "http://m.pann.nate.com/video/videoPlayUrlRealTime?video_id=" + videoid + "",
          "format": "MP4",
          "isNative": true
        }]
      }]
    });
  },

  // mobile video via Egloos
  "processEgloosVideoID": function(videoid, blogid, serial, callback) {
    callback({
      "playlist": [{
        "sources": [{
          "url": "http://ebc.egloos.com/exec/mobile/play_movile_video.php?movieid=" + videoid + "&blogid=" + blogid + "&serial=" + serial + "",
          "format": "MP4"
          "isNative": true
        }]
      }]
    });
  }
});
