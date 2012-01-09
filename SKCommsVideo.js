addKiller("SKCommsVideo", {
  "canKill": function(data) {
    var match = data.src.match(/(cyworld|nate|egloos)\.com/ig);
    if (match) {
      data.site = match[1];
      return true;
    } else return false;
  },

  "process": function(data, callback) {
    var flashvars = parseFlashVariables(data.params.flashvars);
    var mov_id, v_key, url;
	  // nate video
    if (flashvars.mov_id && flashvars.v_key) {
      mov_id = flashvars.mov_id;
      v_key = flashvars.v_key;
      url = "http://v.nate.com/movie_url.php?mov_id=" + mov_id + "&v_key=" + v_key;
      this.processNateVideoXml(url, callback);
	  // embedded video player (egloos, cyworld, etc.)
    } else {
      var blogid, serial;
      var match = data.src.replace(/\|/g, "%7C").match(/(dbi\.video|v)\.(cyworld|nate|egloos)\.com\/v\.sk\/(movie|egloos)\/(0|[a-z]\d+)%7C(\d+)\/(\d+)/);
      if (match) {
        blogid = match[4];
        serial = match[5];
        mov_id = match[6];
        if (blogid != "0") {
          this.processEgloosVideoID(mov_id, blogid, serial, callback);
        } else {
          this.processNateVideoID(mov_id, callback);
        }
      }
    }
  },

  // flash video via Nate video
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
            "isNative": (/\.mp4$/.test(mov_url)) ? true : false
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
  }
});
