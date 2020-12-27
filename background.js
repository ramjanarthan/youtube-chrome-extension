var hasRequested = false

function logURL(requestDetails) {
    console.log("Loading: " + requestDetails.url);
    
    if (requestDetails.url.startsWith('https://www.youtube.com/api/timedtext?') && !hasRequested) {
        hasRequested = true
        console.log("Captions API")

        fetch(requestDetails.url)
        .then(function (response) {
            return response.json();
          })
          .then(function (myJson) {
            let captionSlices = generateCaptionSlices(myJson)
            let storageJSON = { }
            // storageJSON[window.location.href] = captionSlices
            storageJSON["captionSlices"] = captionSlices

            console.log(storageJSON);
            return browser.storage.local.set(storageJSON)
          })
          .then(function (_) {
              console.log(`Added to browser storage with key ${window.location.href}`)
          })
          .catch(function (error) {
            hasRequested = false
            console.log("Error: " + error);
          });

          console.log("passed code")
    } else {
        console.log("Skipping sending since already requested or not YT Timed text API")
    }
}

/*

CaptionSlice {
    startTime: number,
    duration: number,
    text: string
};

*/

function generateCaptionSlices(jsonResponse) {
    if (jsonResponse["events"]) {
        return jsonResponse["events"].map(transformJSONToCaptionSlice)
    }
}

function transformJSONToCaptionSlice(eventJson) {
    let text = eventJson["segs"].reduce(function(prev, curr) {
        return prev + " " + curr.utf8
    })  

    return {
        "startTime": eventJson["tStartMs"],
        "duration": eventJson["dDurationMs"],
        "text": text
    }
}

browser.webRequest.onBeforeRequest.addListener(
	logURL,
	{urls: ["<all_urls>"]}
);