// Constants
let youtubeVideoIDParamKey = "v"

// Observations
browser.webRequest.onBeforeRequest.addListener(
    processWebRequest,
    {urls: ["https://www.youtube.com/api/timedtext*"]}
)

// Buisness logic
function processWebRequest(requestDetails) {
    console.log(`Processing web request: ${JSON.stringify(requestDetails)}`)

    if (!requestDetails.url.startsWith('https://www.youtube.com/api/timedtext?')) {
        console.log("skipping")
        return
    }

    let requestURL = new URL(requestDetails.url)
    let videoID = requestURL.searchParams.get(youtubeVideoIDParamKey)

    if (!videoID) {
        console.log("can't find video id, skipping")
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
            console.log(`Has captions for : ${videoID}`)
            return true
        } else {
            console.log(`No captions for : ${videoID}`)
            return false
        }
    })
}

function saveCaptionsForURL(videoID, captionSlices) {
    console.log(`Setting captions for : ${videoID} captions: ${captionSlices}`)

    let storageJSON = { }
    storageJSON[videoID] = captionSlices
    return browser.storage.local.set(storageJSON)
}

function interceptTimedTextRequest(requestDetails) {
    console.log("Loading Captions API: " + requestDetails.url);

    return fetch(requestDetails.url)
    .then(function (response) {
        console.log("Loaded successfully")

        return response.json();
    })
    .then(function (myJson) {
        console.log("Decoded successfully")

        let captionSlices = generateCaptionSlices(myJson)
        return captionSlices
    })
    .catch(function (error) {
        console.log("Error: " + error);
    })
}

console.log("Hello")

// Response Handling
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