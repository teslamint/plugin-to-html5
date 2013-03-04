addKiller("IGN", {

"canKill": function(data) {
	return /\/IGNPlayer\.swf/.test(data.src);
},

"process": function(data, callback) {
	var configURL = decodeURIComponent(parseFlashVariables(data.params.flashvars).url).replace(/[?#].*/, "");
	if(!/\.config$/.test(configURL)) configURL += ".config";
	
	var _this = this;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", configURL, true);
	xhr.addEventListener("load", function() {
		_this.processConfig(JSON.parse(xhr.responseText), !/^http:\/\/www\.ign\.com\/videos\//.test(data.location), callback);
	}, false);
	xhr.send(null);
},

"processConfig": function(config, isEmbed, callback) {
	var media = config.playlist.media;
	
	var siteInfo;
	if(isEmbed) siteInfo = {"name": "IGN", "url": media.metadata.url.replace(/\\\//g, "/")};
	
	var videoURL = media.url.replace(/\\\//g, "/");
	var poster = media.poster[0].url.replace(/\\\//g, "/").replace(/\{size\}/, "large");
	
	callback({
		"playlist": [{
			"title": media.metadata.title,
			"sources": [{"url": videoURL, "format": "MP4", "height": 720, "isNative": true}],
			"poster": poster,
			"siteInfo": siteInfo
		}]
	});
}
	
});
