# youtube-chrome-extension

TODO list Bugs:
- Store caption slices individually for each video (Done)
- Hide previous results when beginning a new search (Done)
- Observe on screen size changes to recalculate/draw caption search results on scrubber
- Observe on tab change to update current URL

TODO list Improvements:
- Polish the UI
- Add a button to the YT scrubber area directly for search (near the captions button), instead of using the extension icon in the extensions bar (Figure out some way to get captions directly? Or better the UX...)
- Fuzzy search enabled

Update:
New UX:

1. Button added to the Youtube Right button list
2. CC+ button auto triggers CC button if no captions found for that site, also shows an input to recieve user input
3. Uses old logic to dislay time slices as usual
4. TODO:
    4.1 Fix positioning of CC+ button
    4.2 Fix resizing of time slices