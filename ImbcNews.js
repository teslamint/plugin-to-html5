addKiller("ImbcNews", {
"canKill": function(data) {
	if(data.src.indexOf("ImbcNewsPlayer.swf") !== -1) return true;
	return false;
},

"process": function(data, callback) {
	// in & out
	var flashvars = parseFlashVariables(data.params.flashvars);
	// rtmp://vod.imnews.imbc.com/vod/_definst_/mp4:newsvod/desk/2012/09/mbc_desk_20120902_3_500k.mp4
	var match = flashvars.vodUrl.match(/^rtmp:\/\/(.+)\.mp4$/i);
	if(match) {
		// http://vod.imnews.imbc.com/vod/_definst_/mp4:newsvod/desk/2012/09/mbc_desk_20120902_3_500k.mp4/playlist.m3u8
		var url = "http://"+ match[1] +".mp4/playlist.m3u8";
		callback({
			"playlist": [{
				"sources": [{
					"url": url,
					"format": "MP4",
					"isNative": true
				}]
			}]
		});

	}
}

});
