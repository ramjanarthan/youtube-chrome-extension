// Observations
var currentTabURL = ""

browser.tabs.onActivated.addListener(tab => {
    browser.tabs.get(tab.tabId, current_tab_info => {
        currentTabURL = current_tab_info.url
    })
})

browser.webRequest.onBeforeRequest.addListener(
    processWebRequest,
    {urls: ["<all_urls>"]}
)

// Buisness logic
function processWebRequest(requestDetails) {
    console.log(`Processing web request: ${requestDetails}`)

    if (!requestDetails.url.startsWith('https://www.youtube.com/api/timedtext?')) {
        console.log("skipping")
        return
    }

    shouldInterceptRequest()
    .then((shouldIntercept) => {
        if (!shouldIntercept) {
            return 
        }

        return interceptTimedTextRequest(requestDetails)
        .then(function (captionSlices) {
            return saveCaptionsForURL(currentTabURL, captionSlices)
        })
    })
    .catch(function (error) {
        console.log("Error: " + error);
    });
}

function shouldInterceptRequest() {
    let url = currentTabURL

    if (!url) {
        return new Promise((_, reject) => {
            reject("No URL!?")
        })
    }

    return hasCaptionsForURL(url)
        .then((hasCaptions) => {
            return !hasCaptions
        })
}

// Storage APIs
function hasCaptionsForURL(url) {
    return browser.storage.local.get([url])
    .then((data) => {
        if (data[url]) {
            console.log(`Has captions for : ${url}`)
            return true
        } else {
            console.log(`No captions for : ${url}`)
            return false
        }
    })
}

function saveCaptionsForURL(url, captionSlices) {
    console.log(`Setting captions for : ${url} captions: ${captionSlices}`)

    let storageJSON = { }
    storageJSON[url] = captionSlices
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

    let text = eventJson["segs"].reduce(function(prev, curr) {
        return prev + " " + curr.utf8
    })  

    return {
        "startTime": eventJson["tStartMs"],
        "duration": eventJson["dDurationMs"],
        "text": text
    }
}