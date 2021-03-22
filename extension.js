console.log("Starting to load")
// Constants
let youtubeVideoIDParamKey = "v"

// Observations
browser.runtime.onMessage.addListener((msg, sender, repsonse) => {
	if (msg.command == 'confirm') {
		processSearchRequest(msg.input, msg.url)
	}
})

// Search Request Handling
function processSearchRequest(query, activeURL) {
	console.log(`Processing search request with query: ${query} url: ${activeURL}`)
	hideCaptionSlices()

	findClosestMatches(query, activeURL)
		.then((results) => {
			if (results.length > 0) {
				let times = results.reduce (function(prev, curr) {
					return prev + " " + `${curr["startTime"]/1000} secs, `
				}, "")

				console.log(`Here are your best times: ${times}`)
				displayCaptionSlices(results)
			} else {
				console.log('Couldnt find any accurate results')
			}
		})

	let totalTime = getTotalTime()
	let timeInSeconds = convertTimestampToSeconds(totalTime)
	console.log(`Captured time:  ${totalTime} in seconds: ${timeInSeconds}`)
}	

/*

CaptionSlice {
    startTime: number,
    duration: number,
    text: string
};

*/
function findClosestMatches(searchText, url) {
	console.log(`findClosestMatches ${searchText}`)

	if (searchText.length <= 0) {
		return new Promise((resolve, _) => {
			resolve([])
		})
	}

	let requestURL = new URL(url)

	return getCaptionsForURL(requestURL)
		.then((captionSlices) => {
			var result = []

			console.log(`Reaching A ${captionSlices}`)
			console.log(`Bool ${!captionSlices}`)

			if (!captionSlices || captionSlices.length == 0) {
				console.log(`no slices ${result}`)
				return result
			}

			captionSlices.forEach(captionSlice => {
				console.log(`Reaching X ${captionSlice}`)

				if(captionSlice["text"].includes(searchText)) {
					console.log(`Reaching Y`)

					result.push(captionSlice)
				}
			})
		
			console.log(`Reaching C ${result}`)
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

function hideCaptionSlices() {
	$(".yte-captionslice-timestamp").remove()
}

function calculateLeftOffsetForCaptionSlice(captionSlice, totalTime) {
	if (!totalTime) {
		return null
	}


	let sliceTimeInSeconds = captionSlice["startTime"] / 1000
	console.log(`sliceTimeInSeconds ${sliceTimeInSeconds}`)
	console.log(`totalTime ${totalTime}`)

	console.log(`container width ${$(".ytp-chapters-container").width()}`)
	console.log(`marker width ${$(".ytp-timed-markers-container").width()}`)
	console.log(`marker width ${$(".ytp-progress-bar-padding").width()}`)


	let offset = (sliceTimeInSeconds / totalTime) * $(".ytp-chapters-container").width()
	console.log(`Offset ${offset}`)
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

console.log("Loaded")