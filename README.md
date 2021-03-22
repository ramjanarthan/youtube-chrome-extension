# youtube-chrome-extension

TODO list Bugs:
- Store caption slices individually for each video (Done)
- Hide previous results when beginning a new search (Done)
- Observe on screen size changes to recalculate/draw caption search results on scrubber
- Observe on tab change to update current URL
- Respond when no captions found, or captions found

TODO list Improvements:
- Polish the UI
- Add a button to the YT scrubber area directly for search (near the captions button), instead of using the extension icon in the extensions bar (Figure out some way to get captions directly? Or better the UX...)
- Fuzzy search enabled


Notes:
- Browser.tabs is not available in extension.js, only in background.js... Didnt see this in the docs 