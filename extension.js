document.addEventListener('DOMContentLoaded', function() {
	var submitButton = document.getElementById('mybutton');
	submitButton.onClick = onMyButtonClick();
	var input = document.getElementById('input');
});

function onMyButtonClick(){
	//var input = document.getElementById('input');
	//var text = input.value;
	//console.log(" -- working :)");
	window.alert("test");
}