---
layout: post
title: MapRedux - PowerShell and Big Data
tags: PowerShell MapReduce
---
{{ page.title }}
====================
Have you been hearing about "big data", "map reduce" and other large scale computing terms over the past couple of years and been 
curious to dig into more detail? Have you read some of the [Apache Hadoop](http://hadoop.apache.org/) online documentation and unfortunately concluded that it 
wasn't feasible to setup a "test" hadoop environment on your machine? More recently, I have read about some of Microsoft's work to 
enable [Hadoop on the Azure cloud](https://www.hadooponazure.com/). Being a "Microsoft"-leaning technologist, I am more inclinded to be successful with experimentation 
when on the Windows platform. Of course, it is not that I am "religious" about one set of technologies other another, but rather more experienced.

Anyway, within the past couple of weeks I have been thinking about PowerShell a bit more as the [2012 PowerShell Scripting Games](http://blogs.technet.com/b/heyscriptingguy/archive/2012/03/27/how-to-register-for-the-2012-powershell-scripting-games.aspx)
approach and it occured to me that PowerShell's support for Windows Remote Management (WinRM), and some other inherent features of PowerShell 
might lend themselves particularly well to a simple implementation of the MapReduce framework. I fired up my PowerShell ISE and started 
writing just to see where it would take me.