export class Loader {
  protected apiLocation: string;

  constructor(apiLocation: string) {
    this.apiLocation = apiLocation;
  }

  public callServer(
    action: string,
    params: any,
    callback: (object) => any,
    failCallback: (str) => any
  ) {
    const xhr = new XMLHttpRequest();

    params.action = action;

    xhr.open("POST", this.apiLocation, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = () => {
      const DONE: number = 4; // readyState 4 means the request is done.
      const OK: number = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          let object;
          try {
            object = JSON.parse(xhr.responseText);
          } catch (e) {
            failCallback("Could not decode this JSON: " + xhr.responseText);
            return;
          }
          if (object.rc > 0) {
            failCallback(object.msg);
            return false;
          } else {
            callback(object.data);
            return true;
          }
        } else {
          failCallback("Error: " + xhr.status);
          return false;
        }
      }
    };
    // var formData = this.paramsToFormData(params);
    const queryString = this.param(params);
    xhr.send(queryString);
  }

  protected paramsToFormData(params: object): FormData {
    const formData = new FormData();
    for (const key in params) {
      if (params[key] !== undefined) {
        formData.append(key, params[key]);
      }
    }
    return formData;
  }

  protected param(object: object): string {
    let encodedString = "";
    for (const prop in object) {
      if (object.hasOwnProperty(prop)) {
        if (encodedString.length > 0) {
          encodedString += "&";
        }
        encodedString += encodeURI(prop + "=" + object[prop]);
      }
    }
    return encodedString;
  }
}
