---
layout: post
title: DNScymbal Updated for DNSimple API v1
tags: DNS, DNScymbal, GitHub
---
{{ page.title }}
----------------
I received a tweet about a month ago from [@DNSimple](https://twitter.com/dnsimple):

<div style="text-align:center">
<blockquote class="twitter-tweet" lang="en"><p>New blog post: <a href="http://t.co/UZ1jSkQWyp">http://t.co/UZ1jSkQWyp</a> API v0 end of life and API v1 2FA timelines</p>&mdash; DNSimple (@dnsimple) <a href="https://twitter.com/dnsimple/status/513961907196559360">September 22, 2014</a></blockquote> <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

"Well", I thought, "that means I need to revisit DNScymbal, my app for dynamically maintaining an IP / DNS mapping in the DNSimple DNS system.". 

Tonight I dove in to see what was needed inorder to support the v1 API. As it turns out, the process was fairly straight forward for my app, DNScymbal, mostly thanks to [Adam Anderly](https://twitter.com/anderly). DNScymbal uses
Adam's [DNSimple.API](https://github.com/anderly/dnsimple-csharp), which is a .NET API for the [DNSimple REST API](http://developer.dnsimple.com/). A couple of hours later, I had finished the updates and some light testing and was ready to post the
updated installer package on my website. 

Here are some links to download the installer package, or to GitHub where you can fork the repo and get creative:

* [Download the latest version of DNScymbal (1.1.5410) - Released Oct 24, 2014](http://www.dittenhafer.net/downloads/DNScymbal/DNScymbalSetup-1.1.5410.msi)
* [Highlevel Documenation](https://github.com/dwdii/DNScymbal/blob/master/README.md)
* [DNScymbal on GitHub](https://github.com/dwdii/DNScymbal)

Best,

[Daniel (@dwdii)](http://twitter.com/dwdii)
