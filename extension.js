var captions = []

var start = 0

window.addEventListener('click', function(_e) {
	console.log("Click registered")
    var target = _e.target;

    switch(target.id) {
		case 'mybutton':
			let searchText = document.getElementById('input').value
			let results = findClosestMatches(searchText)

			
			if (results.length > 0) {
				let times = results.reduce (function(prev, curr) {
					return prev + " " + `${curr["startTime"]/1000} secs, `
				}, "")
				console.log(`Here are your best times: ${times}`)
			} else {
				console.log('Couldnt find any accurate results')
			}
	}

	let totalTime = getTotalTime()
	let timeInSeconds = convertYoutubeEndTimeToSeconds(totalTime)
	console.log(`Captured time:  ${totalTime} in seconds: ${timeInSeconds}`)
});

/*

CaptionSlice {
    startTime: number,
    duration: number,
    text: string
};

*/
function findClosestMatches(searchText) {
	var result = []

	if (searchText.length <= 0) {
		return result
	}

	captions.forEach(function(captionSlice) {
		if(captionSlice["text"].utf8.includes(searchText)) {
			result.push(captionSlice)
		}
	})

	return result
}

console.log("Hello YT")

browser.storage.local.get()
	.then(function(_data) {
		let windowLocation = window.location.href

		console.log(`Getting for captionSlices ${_data}`)
		//console.log(`Trying to get data for : ${windowLocation}`)

		if (_data["captionSlices"]) {
			console.log(`Here's the data: ${_data["captionSlices"]}`)
			captions = _data["captionSlices"]
		} else {
			console.log("Nothing found")
		}
	})

function addCaptionSliceIndicator(captionSlice) {
	jQuery('<div/>', {
		id: 'yte-captionslice-timestamp',
		css: {
			'background-color': 'blue',
			'width': '5',
			'height': '100%',
			'left': start,
			'top': 0,
			'z-index': 40,
			'position': 'absolute',
		}
	}).appendTo(".ytp-progress-list")

	start = start + 50
}

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
*/
function convertYoutubeEndTimeToSeconds(time) {
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