---
layout: post
title: GitHub Pages, Jekyll, Ampersands and Apostrophes
tags: Jekyll
---
{{ page.title }}
----------------
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

<center>
<table id="PageBuildFailedGotchas">
	<tr>
		<th class="text-error">No</th>
		<th class="text-success">Yes</th>
		<th class="text-left">Description</th>
	</tr>
	<tr>
		<td>&amp;</td>
		<td>&amp;amp;</td>
		<td class="text-left">Ampersand</td>
	</tr>
	<tr>
		<td>&#8217;</td>
		<td>&amp;&#35;8217;</td>
		<td class="text-left">Right single quote (apostrophe)</td>
	</tr>
	<tr>
		<td>&#8220;</td>
		<td>&amp;&#35;8220;</td>
		<td class="text-left">Curly left quote (hex byte 93)</td>
	</tr>
	<tr>
		<td>&#8221;</td>
		<td>&amp;&#35;8221;</td>
		<td class="text-left">Curly right quote (hex byte 94)</td>
	</tr>
	<tr>
		<td>&#35;</td>
		<td>&amp;&#35;35;</td>
		<td class="text-left">Hash / Number signs</td>
	</tr>
	<tr>
		<td>&#8211;</td>
		<td>&amp;&#35;8211;</td>
		<td class="text-left">Long hyphen (hex byte 96) (i.e. copy/paste from Word)</td>
	</tr>

</table>
</center>
