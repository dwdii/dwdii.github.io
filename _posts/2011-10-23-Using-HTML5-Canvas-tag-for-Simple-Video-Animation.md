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



Thanks for reading!

[Daniel (@dwdii)](http://twitter.com/dwdii)
