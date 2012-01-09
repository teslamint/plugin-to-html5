addKiller("SKCommsVideo", {
  "canKill": function(data) {
    if (/v\.nate\.com/.test(data.src)) {
      data.site = "nate";
      return true;
    } else if (/v\.egloos\.com/.test(data.src)) {
      data.site = "egloos";
      return true;
    } else if (/dbi\.video\.cyworld\.com/.test(data.src)) {
      data.site = "cyworld";
      return true;
    } else return false;
  },

  "process": function(data, callback) {
    var flashvars = parseFlashVariables(data.params.flashvars);
    var mov_id, vs_keys, v_key, url;
	  // nate video
    if (flashvars.v_key) {
      mov_id = flashvars.mov_id;
      vs_keys = flashvars.vs_keys;
      v_key = flashvars.v_key;
      url = "";
      if (data.site == "nate") {
        url = "http://v.nate.com/movie_url.php?mov_id=" + mov_id + "&v_key=" + v_key;
        this.processNateVideoXml(url, callback);
      }
	  // embedded video player (egloos, cyworld, etc.)
    } else {
      var blogid, serial;
      var headers = ""; //this.getResponseHeader(data.src);
      if (headers) {
        vs_keys = /vs_keys=(0|[a-z]\d+%7C\d+)/.match(headers)[1];
        serial = vs_keys.split("|")[0];
        blogid = vs_keys.split("|")[1];
        mov_id = /mov_id=(\d+)/.match(headers)[1];
        v_key = /v_key=([0-9a-f]+)/.match(headers)[1];
      }

      var match = data.src.replace(/\|/g, "%7C").match(/(dbi\.video|v)\.(cyworld|nate|egloos))\.com\/v\.sk\/(movie|egloos)\/(0|[a-z]\d+)%7C(\d+)\/(\d+)/);
      if (match) {
        blogid = match[3];
        serial = match[4];
        vs_keys = blogid + "|" + serial;
        mov_id = match[5];
      }

      if (v_key) {
        if (data.site == "egloos") {
          url = "http://v.egloos.com/xmovie_url.php?vs_id=egloos&vs_keys=" + vs_keys + "&mov_id=" + mov_id + "&v_key=" + v_key;
        } else {
          url = "http://v.nate.com/xmovie_url.php?vs_id=movie&vs_keys=" + vs_keys + "&mov_id=" + mov_id + "&v_key=" + v_key;
        }
        this.processNateVideoXml(url, callback);
      } else if (data.site == "egloos") {
        this.processEgloosVideoID(blogid, serial, mov_id, callback);
      } else {
        this.processNateVideoID(mov_id, callback);
      }
    }
  },

  "processNateVideoXml": function(xml_url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', xml_url, true);
    xhr.onload = function(event) {
      var result = event.target.responseXML.getElementsByTagName("movie")[0];
      var siteinfo = [];

      var title = result.getElementsByTagName("title")[0].textContent;
      // if title exists, it's embedded player on the other instead Nate.
      if (title) {
        var org_url = result.getElementsByTagName("org_url")[0].textContent;
        var org_name = (/egloos\.com/.test(xml_url)) ? "egloos" : "nate";
        siteinfo.push({"name": org_name, "url": org_url});
      }
      var mov_url = result.getElementsByTagName("mov_urls")[0].getElementsByTagName("url")[0].textContent;
      var thumb_url = result.getElementsByTagName("master_thumbnail")[0].getElementsByTagName("url")[0].textContent;

      callback({
        "playlist": [{
          "title": title,
          "poster": thumb_url,
          "siteinfo": siteinfo,
          "sources": [{
            "url": mov_url,
            "isNative": (/mp4/.test(mov_url)) ? true : false
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
          "isNative": true
        }]
      }]
    });
  },
  
  "getResponseHeader": function(src) {
    // trying to get response header
    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, false);
    xhr.send(null);
    return xhr.getAllResponseHeaders().toLowerCase();
  }
});
