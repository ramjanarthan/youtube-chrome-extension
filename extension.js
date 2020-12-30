var captions = []

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


	$(".ytp-play-progress").css("background-color", "yellow"); 
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