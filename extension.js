document.addEventListener('DOMContentLoaded', function() {
	chrome.tabs.getSelected(null, function(tab){
    console.log(tab);
	});
}