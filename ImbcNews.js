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
		var start_time = flashvars.startTime;
		var end_time = flashvars.endTime;
		var img_url = flashvars.imgUrl;
		// http://vod.imnews.imbc.com/vod/_definst_/mp4:newsvod/desk/2012/09/mbc_desk_20120902_3_500k.mp4/playlist.m3u8
		var url = "http://"+ match[1] +".mp4/playlist.m3u8?wowzaplaystart="+ start_time +"&wowzaplayduration="+ (end_time - start_time);
		callback({
			"playlist": [{
				"poster": imgUrl,
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
