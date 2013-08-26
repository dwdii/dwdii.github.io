---
layout: post
title: Using HTML5 Canvas tag for Simple Video Animation 
tags: HTML5 Canvas
---
{{ page.title }}
-------------------------------------------------
I recently picked up a wireless network camera to use around the house. After getting it up and running, 
I realized that the "mobile" support was less than ideal. The camera's on-board web server provided a still 
image, an ActiveX control or a Java Applet as viewing options and only the still image was usable on my iPhone. 
I decided to try a webpage which would refresh automatically every 1 second in order to get a crude motion video 
effect via the HTML meta tag, as shown below.

{% highlight html linenos %}
<meta http-equiv="Refresh" content="1;url=/cam/">
{% endhighlight %}

After playing with this for a little while and dealing with the "stop motion" video, constant page flicker and inability 
to zoom, etc, I decided to investigate the use of JavaScript to refresh the image while being able to stay on the same 
HTML page. I came up with a decent solution involving setTimeout, the `Image.onLoad` event and CSS z-index, but apparently the 
iPhone Safari doesn't support the z-index property (or maybe something else was wrong). Anyway, I remembered something from a 
presentation I saw on HTML5 about the new Canvas tag for 2-d graphics via JavaScript and decided to see how it might apply to my 
situation. As it turns out, the canvas support in iPhone Safari is great and I am able to use the same code in my Internet Explorer 9 
and iPhone Safari without issue. What follows is the final HTML5/Javascript I have written to refresh the camera image at 
approximately 10 frames/second along with some interesting points to note.

First, the HTML5 canvas tag: simple, but some important attributes. The HTML5 width and height attributes for a canvas are not the 
same as the CSS width and height attributes. This fact had me stumped for a while until I found [this post on StackOverflow](http://stackoverflow.com/questions/6023327/does-html5-canvas-pixel-size-depend-on-the-canvas-size). 
The important take away for me was that I should set the canvas tag's width and height to the size I want the canvas, and I could 
ignore the CSS width and height. I had been specifying the canvas size in CSS as I'm sure many would do naturally in order to 
centralize the styling. Anyway, it turns out that for canvas, HTML5 != CSS in terms of height and width. For simplicity, I dropped 
the CSS width and height and only did the following:

{% highlight html linenos %}
<canvas id="imgCanvas" width="800" height="600" style="border-style:solid;border-color:Gray"/>
{% endhighlight %}

Another "gotcha" I had to deal with was the issue with reloading an image via JavaScript given the caching "help" which browsers 
tend to provide. Interestingly, the workaround I discovered was effectively the same as the camera manufacturer's approach. 
I keep a count variable in the script block and increment it each time before loading the new image. This counter is then 
appended to the image URL as part of the query string, thereby making it just unique enough to bypass the browser’s local 
cache and fetch the new image from the camera.

Thanks for reading!

[Daniel (@dwdii)](http://twitter.com/dwdii)
