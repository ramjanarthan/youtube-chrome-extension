// Constants
let youtubeVideoIDParamKey = "v"

// Observe Tab updated
browser.tabs.onUpdated.addListener(processTabUpdate)
function processTabUpdate(_, changeInfo, tabInfo) {
    if (changeInfo.url) { // URL has changed
        browser.tabs.sendMessage(tabInfo.id, {
            command: "clear",
            url: changeInfo.url,
            msg: "from bg"
        })
    }
}

// Observer web requests
browser.webRequest.onBeforeRequest.addListener(
    processWebRequest,
    {urls: ["https://www.youtube.com/api/timedtext*"]}
)
function processWebRequest(requestDetails) {
    if (!requestDetails.url.startsWith('https://www.youtube.com/api/timedtext?')) {
        return
    }

    let requestURL = new URL(requestDetails.url)
    let videoID = requestURL.searchParams.get(youtubeVideoIDParamKey)

    if (!videoID) {
        return
    }

    shouldInterceptRequest(requestDetails.originUrl, videoID)
    .then((shouldIntercept) => {
        if (!shouldIntercept) {
            return 
        }

        return interceptTimedTextRequest(requestDetails)
        .then(function (captionSlices) {
            return saveCaptionsForURL(videoID, captionSlices)
        })
    })
    .catch(function (error) {
        console.log("Error: " + error);
    });
}

function shouldInterceptRequest(originUrl, videoID) {
    if (!originUrl) {
        return new Promise((_, reject) => {
            reject("No URL!?")
        })
    }

    if (originUrl.startsWith('moz-extension://')) {
        return new Promise((resolve, _) => {
            resolve(false)
        })
    }

    return hasCaptionsForURL(videoID)
        .then((hasCaptions) => {
            return !hasCaptions
        })
}

// Storage APIs
function hasCaptionsForURL(videoID) {
    return browser.storage.local.get([videoID])
    .then((data) => {
        if (data[videoID]) {
            return true
        } else {
            return false
        }
    })
}

function saveCaptionsForURL(videoID, captionSlices) {
    let storageJSON = { }
    storageJSON[videoID] = captionSlices
    return browser.storage.local.set(storageJSON)
}

function interceptTimedTextRequest(requestDetails) {
    return fetch(requestDetails.url)
    .then(function (response) {
        return response.json();
    })
    .then(function (myJson) {
        let captionSlices = generateCaptionSlices(myJson)
        return captionSlices
    })
    .catch(function (error) {
        console.log("Error: " + error);
    })
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
        return jsonResponse["events"]
            .map(transformJSONToCaptionSlice)
            .filter(function(slice) {
              return slice != null
            })
    }
}

function transformJSONToCaptionSlice(eventJson) {
    if (!eventJson["segs"]) {
        return null
    }

    let text = eventJson["segs"]
        .reduce(function(prev, curr) {
            let currString = curr["utf8"] ? curr["utf8"] : ""
            return prev + " " + currString
        }, "")

    return {
        "startTime": eventJson["tStartMs"],
        "duration": eventJson["dDurationMs"],
        "text": text
    }
}