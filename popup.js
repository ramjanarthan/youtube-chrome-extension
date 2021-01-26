$(function() {
    $('#confirmButton').on('click', function() {
        browser.tabs.query({currentWindow: true, active: true}, tabs => {
            var activeTab = tabs[0]
            var text = $('#myInput').val()
            browser.tabs.sendMessage(activeTab.id, { 
                command: "confirm", 
                url: activeTab.url,
                input: text
            })
        })
    })
})