---
layout: post
title: GitHub Pages, Jekyll, Ampersands and Apostrophes
tags: Jekyll
---
{{ page.title }}
====================
Why am I getting this "page build failed" error on my GitHub Pages checkin? I have been asking myself that question lately.
I've been migrating my blog into GitHub Pages, but haven't taken the time to setup Ruby and Jekyll on my 
Windows 7 dev machine. [GitHub Pages Help recommends running the Jekyll build locally](https://help.github.com/articles/pages-don-t-build-unable-to-run-jekyll#syntax-errors) 
to troubleshoot these errors, but the ["official documentation does not support installation on Windows platforms"](http://jekyllrb.com/docs/installation/). 

Anyway, a couple of my blog posts have resulted in "page build failed" emails from GitHub Support. 
These emails are useful from the point of view that it is nice to know that something has gone wrong, but they 
don't provide any indication of what is wrong or even which page is the culprit. I hope some day soon
the emails will include some more detail, but until then... 

Through some tedious troubleshooting, backing out the blog post, and re-pushing the paragraphs
and code snippets back up to GitHub, I have deduced some gotchas that come from copying and pasting
from webpages into markdown. I hope the following table can illustrate simply to others what to look
out for and how to rectify. Interestingly, the "Greater than" sign (">") does not need to be encoded.

<table style="border-width:1px;border-style:solid;padding:3px;">
	<tr>
		<th>No</th>
		<th>Yes</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>&amp;</td>
		<td>&amp;amp;</td>
		<td>Ampersand</td>
	</tr>
	<tr>
		<td>&apos;</td>
		<td>&amp;apos;</td>
		<td>Apostrophe</td>
	</tr>
	<tr>
		<td>&#35;</td>
		<td>&amp;&#35;35;</td>
		<td>Hash / Number signs</td>
	</tr>
	<tr>
		<td>(???)</td>
		<td>-</td>
		<td>Long hyphen (hex byte 96) (i.e. copy/paste from Word)</td>
	</tr>
</table>

* These result are based on my experience when GitHub Pages was used Jekyll 1.1.2 per the
[github-pages.gemspec](https://github.com/github/pages-gem/blob/master/github-pages.gemspec#L16)