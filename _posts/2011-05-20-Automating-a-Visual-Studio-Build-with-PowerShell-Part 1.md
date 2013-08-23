---
layout: post
title: Automating a Visual Studio Build with PowerShell - Part 1 
tags: PowerShell VisualStudio MSBuild
---
{{ page.title }}
-------------------------------------------------
One of the several hats I wear at work is one of configuration manager for the internal data management application my employer uses. 
This app currently has 11 solutions of active code which need to be built whenever we release to the QA environment. The QA releases 
typically occur a minimum of 3 times per month and take approximately 30 minutes from source control "Get Latest" to the final step 
of the deployment onto the QA servers.

A few years ago, my team automated the post-build deployment steps using a CMD batch script, but the build process has continued to 
be done manually by loading each solution, and rebuilding along with some logistical steps of pre-cleaning and saving the build log. 
After participating in the [2011 Scripting Games](http://bit.ly/2011sgall/), I started thinking that I could use PowerShell to automate the build process and cut 
the QA release time significantly. I've started developing some scripts to make this happen and through this article would like to start sharing some of the useful functions.

First I decided to use [MSBUILD.EXE](http://bit.ly/kz21Ad) as the basis for the builds. I know [TFS Build Server](http://bit.ly/kG2hy6) uses this tool also, and it just makes sense for any Visual Studio build process. My app is still using Visual Studio 2005 and .Net Framework v2 (I hope to upgrade to VS2008 later this year), so my efforts revolve around the v2.0.50727 flavor of MSBUILD.EXE, but I imagine much of my research is applicable to v3.5 and v4 as well.

I found a [useful article and response on StackOverflow](http://bit.ly/kjjRED) which helped me with some of the early development of my script, but then I went off in my own direction. I found that I could use the "splatting" technique and the Start-Process command to improve the interaction with MSBUILD and have some additional control over the build log output, as shown below with a command to rebuild the specified solution.

{% highlight powershell linenos %}
# Local Variables
$MsBuild = $env:systemroot + "\Microsoft.NET\Framework\v2.0.50727\MSBuild.exe";
 
$BuildArgs = @{
	FilePath = $MsBuild
	ArgumentList = $SlnFilePath, "/t:rebuild", ("/p:Configuration=" + $Configuration), "/v:minimal"
	RedirectStandardOutput = $BuildLog
	Wait = $true
}
 
# Start the build
Start-Process @BuildArgs
{% endhighlight %}

I've been developing a PowerShell Module to wrap all the MSBuild code, so the above code is wrapped in the function `Build-VisualStudioSolution` which takes `$SlnFilePath`, `$Configuration` and `$BuildLog` as parameters. 
With that said, I plan to have a series of posts on the topic of Visual Studio build automation with PowerShell, thereby making this Part 1. Stay tuned.... once the module is more put together and ready for public consumption, I hope to make it available for download.

Thanks for reading!

[Daniel (@dwdii)](http://twitter.com/dwdii)
