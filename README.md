# What is this?
Today, if you want to draw a line, box, text whatever on a screen, there's a function for that. Back in the days of MS-DOS game programming, you were given a pointer to video RAM, and that's it! This project is about going back to those roots (granted, in the web, with JavaScript). Everything will be rendered using a typed byte array to a canvas element. No "modern" tools like `drawLine` will be used. This could also make it easier to port to other platforms in the future.


# TODO
- [x] Need game render loop to be separate from game state loop. Render loop should just be called with requestAnimationFrame
- [ ] Sprite loader (in progress)
