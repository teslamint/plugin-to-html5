// ВКонтакте killer (2012-08-13)

addKiller("ВКонтакте", {

"canKill": function(data) {
	return data.src.indexOf("vkontakte.ru/swf/") !== -1 || data.src.indexOf("vk.com/swf/") !== -1;
},

"process": function(data, callback) {
	var flashvars = parseFlashVariables(data.params.flashvars);
	
	var posterURL = decodeURIComponent(flashvars.thumb);
	var title = unescapeHTML(decodeURIComponent(flashvars.md_title));
	var sources = [];
	
	var host = decodeURIComponent(flashvars.host);
	var hd = parseInt(flashvars.hd);
	
	if(flashvars.uid && flashvars.uid !== "0") {
		var url = "http://cs" + host + ".vk.com/u" + decodeURIComponent(flashvars.uid) + "/videos/" + decodeURIComponent(flashvars.vtag) + ".";
		if(hd >= 3) sources.push({"url": url + "720.mp4", "format": "720p MP4", "height": 720, "isNative": true,});
		if(hd >= 2) sources.push({"url": url + "480.mp4", "format": "480p MP4", "height": 480, "isNative": true,});
		if(hd >= 1) sources.push({"url": url + "360.mp4", "format": "360p MP4", "height": 360, "isNative": true});
		if(flashvars.no_flv === "1") {
			sources.push({"url": url + "240.mp4", "format": "240p MP4", "height": 240, "isNative": true});
		} else if(canPlayFLV) {
			sources.push({"url": url + "flv", "format": "240p FLV", "height": 240, "isNative": false});
		}
	} else if(canPlayFLV) {
		if(!/^http:/.test(host)) host = "http://" + host;
		var url = host + "/assets/video/" + decodeURIComponent(flashvars.vtag) + decodeURIComponent(flashvars.vkid) + ".vk.flv";
		sources.push({"url": url, "format": "240p FLV", "height": 240, "isNative": false});
	}
	
	callback({
		"playlist": [{"poster": posterURL, "title": title, "sources": sources}]
	});
}

});
