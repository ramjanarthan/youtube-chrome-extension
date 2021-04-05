$(function() {
    // Observations
    browser.runtime.onMessage.addListener((msg, sender, repsonse) => {
        if (msg.command == 'popup-searchSuccess') {
            $('#searchResultMessage').text("😄")
            $('#searchResultMessage').show()
        } else if (msg.command == 'popup-searchFail') {
            $('#searchResultMessage').text("😵")
            $('#searchResultMessage').show()
        }  else if (msg.command == 'popup-searchClear') {
            $('#searchResultMessage').hide()
        }
    })

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

    $('#clearButton').on('click', function() {
        browser.tabs.query({currentWindow: true, active: true}, tabs => {
            var activeTab = tabs[0]
            browser.tabs.sendMessage(activeTab.id, { 
                command: "clear",
                msg: "from foreground"
            })
        })
    })  
})
