console.log("Starting to load")
// Constants / State
let youtubeVideoIDParamKey = "v"

var displayState = {
	shouldDisplay: false,
	captionSlices: []
}

function resetDisplayState() {
	displayState = {
		shouldDisplay: false,
		captionSlices: []
	}
}

function updateDisplayState(newState) {
	displayState = newState
}

// Observations
browser.runtime.onMessage.addListener((msg, sender, repsonse) => {
	if (msg.command == 'confirm') {
		triggerCaptionsRequest()
		setTimeout(function() {
			processSearchRequest(msg.input, msg.url)
		}, 200)
	} else if (msg.command == 'clear') {
		removeCaptionSlices()
		resetDisplayState()

		browser.runtime.sendMessage({'command': 'popup-searchClear'})
	}
})

elem = $(".ytp-chrome-bottom")[0];  
let resizeObserver = new ResizeObserver(() => {
	if (displayState.shouldDisplay) {
		console.log('reseting display due to resize')
		displayCaptionSlices(displayState.captionSlices)
	}
});
resizeObserver.observe(elem);

// Search Request Handling
function processSearchRequest(query, activeURL) {
	console.log(`Processing search request with query: ${query} url: ${activeURL}`)
	removeCaptionSlices()

	findClosestMatches(query, activeURL)
		.then((results) => {
			if (results.length > 0) {
				let times = results.reduce (function(prev, curr) {
					return prev + " " + `${curr["startTime"]/1000} secs, `
				}, "")

				console.log(`Here are your best times: ${times}`)
				browser.runtime.sendMessage({'command': 'popup-searchSuccess'})
				displayCaptionSlices(results)
				updateDisplayState({ shouldDisplay: true, captionSlices: results})
			} else {
				browser.runtime.sendMessage({'command': 'popup-searchFail'})
				resetDisplayState()
				console.log('Couldnt find any accurate results')
			}
		})
}	

/*

CaptionSlice {
    startTime: number,
    duration: number,
    text: string
};

*/
function findClosestMatches(searchText, url) {
	if (searchText.length <= 0) {
		return new Promise((resolve, _) => {
			resolve([])
		})
	}

	let requestURL = new URL(url)

	return getCaptionsForURL(requestURL)
		.then((captionSlices) => {
			var result = []
			if (!captionSlices || captionSlices.length == 0) {
				console.log(`no slices ${result}`)
				return result
			}

			captionSlices.forEach(captionSlice => {
				if(captionSlice["text"].includes(searchText)) {
					result.push(captionSlice)
				}
			})
		
			return result
		})
}

// INPUT: URL Obj
function getCaptionsForURL(url) {
	if (!url || !url.searchParams) {
		return new Promise((resolve, _) => {
			resolve([])
		})
	}

	let videoID = url.searchParams.get(youtubeVideoIDParamKey)
	if (!videoID) {
		return new Promise((resolve, _) => {
			resolve([])
		})
	}

	return browser.storage.local.get([videoID])
		.then((data) => {
			console.log(`data ${data[videoID]}`)
			return data[videoID]
		})
}

// MARK: UI Manipulation 
function displayCaptionSlices(slices) {
	removeCaptionSlices()
	let totalTime = getTotalTimeInSeconds()
	if(!totalTime) {
		console.error("Couldnt find total time")
		return
	}
	
	slices.forEach (slice => {
		let offset = calculateLeftOffsetForCaptionSlice(slice, totalTime)
		addCaptionSliceIndicator(offset)
	})
}

function removeCaptionSlices() {
	$(".yte-captionslice-timestamp").remove()
}

function calculateLeftOffsetForCaptionSlice(captionSlice, totalTime) {
	if (!totalTime) {
		return null
	}


	let sliceTimeInSeconds = captionSlice["startTime"] / 1000
	let offset = (sliceTimeInSeconds / totalTime) * $(".ytp-chapters-container").width()

	return offset
}

function addCaptionSliceIndicator(leftPosition) {
	jQuery('<div/>', {
		class: 'yte-captionslice-timestamp',
		css: {
			'background-color': 'blue',
			'width': '5',
			'height': '100%',
			'left': leftPosition,
			'top': 0,
			'z-index': 40,
			'position': 'absolute',
		}
	}).appendTo(".ytp-progress-list")
}   
 
// MARK: Time Calculations
function getTotalTime() {
    let endTime = $(".ytp-bound-time-right").text()

    if (endTime) {
        return endTime
    } else {
        return null
    }
}

function getTotalTimeInSeconds() {
	return convertTimestampToSeconds(getTotalTime())
}

/*
	time: dd:hh:mm:ss
	Day: Hour: Minutes: Seconds
*/
function convertTimestampToSeconds(time) {
	if (!time) {
		return 0
	}

	let components = time.split(':')
	let secondsMultiplier = [1, 60, 3600, 86400]
	var multiplierIndex = 0

	var seconds = 0

	while (components.length > 0) {
		let curr = parseInt(components.pop())
		seconds += (curr * secondsMultiplier[multiplierIndex])
		multiplierIndex += 1
	}

	return seconds
}

// Loading captions
function triggerCaptionsRequest() {
	$(".ytp-subtitles-button").click()

	$(".ytp-subtitles-button").click()
}

console.log("Loaded")