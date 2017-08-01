class Loader {

	apiLocation: string;
	
	constructor(apiLocation: string) {
		this.apiLocation = apiLocation;
	}

	callServer(action: string, params: object, callback: (object) => any, failCallback: (string) => any) {
		var xhr = new XMLHttpRequest();
		
		params['action'] = action;
		
		
		xhr.open('POST', this.apiLocation, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		xhr.onreadystatechange = function () {
  			var DONE: number = 4; // readyState 4 means the request is done.
  			var OK: number = 200; // status 200 is a successful return.
			if (xhr.readyState == DONE) {
				if (xhr.status == OK) {
					var object = JSON.parse(xhr.responseText);
					if (object.rc > 0) {
						failCallback(object.msg);
					} else {
						callback(object);
					}
				} else {
					failCallback('Error: ' + xhr.status);
				}
			}
		};
		//var formData = this.paramsToFormData(params);
		var queryString = this.param(params);
		xhr.send(queryString);
	}

	paramsToFormData(params: object) : FormData {
		var formData = new FormData();
		for (var key in params) {
			formData.append(key, params[key]);
		}
		return formData;
	}

	param(object: object) : string {
		var encodedString = '';
		for (var prop in object) {
			if (object.hasOwnProperty(prop)) {
				if (encodedString.length > 0) {
					encodedString += '&';
				}
				encodedString += encodeURI(prop + '=' + object[prop]);
			}
		}
		return encodedString;
	}
}
