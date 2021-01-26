// Observations
var currentTabURL = ""

// browser.tabs.onActivated.addListener(tab => {
//     browser.tabs.get(tab.tabId, current_tab_info => {
//         currentTabURL = current_tab_info.url
//     })
// })

browser.runtime.onMessage.addListener((msg, sender, repsonse) => {
	if (msg.command == 'confirm') {
		processSearchRequest(msg.input, msg.url)
	}
})

// Search Request Handling
function processSearchRequest(query, activeURL) {
	console.log(`Processing search request with query: ${query} url: ${activeURL}`)

	findClosestMatches(query, activeURL)
		.then((results) => {
			if (results.length > 0) {
				let times = results.reduce (function(prev, curr) {
					return prev + " " + `${curr["startTime"]/1000} secs, `
				}, "")
				console.log(`Here are your best times: ${times}`)
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
	var result = []

	if (searchText.length <= 0) {
		return new Promise((resolve, _) => {
			resolve(result)
		})
	}

	return getCaptionsForURL(url)
		.then((captionSlices) => {
			if (!captionSlices) {
				return result
			}
			 
			captionSlices.forEach(function(captionSlice) {
				if(captionSlice["text"].utf8.includes(searchText)) {
					result.push(captionSlice)
				}
			})
		
			return result
		})
}


function getCaptionsForURL(url) {
	return browser.storage.local.get([url])
		.then((data) => {
			return data[url]
		})
}

console.log("Hello YT")

// MARK: UI Manipulation 
function displayCaptionSlices(slices) {

}

function hideCaptionSlices() {

}

function addCaptionSliceIndicator(captionSlice, leftPosition) {
	jQuery('<div/>', {
		id: 'yte-captionslice-timestamp',
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