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

Quite simply, the ScriptBlock feature combined with the ability of `Invoke-Command` to create remote jobs on networked servers provides 
much of the plumbing of a distributed computing environment. There are some limiting factors of course. Microsoft provided some default 
settings which prevent PowerShell from taking over a network without administrative approval first. But even with just one adjustment, 
a given Windows-based machine can become a node in a MapReduce-style distributed computing environment. 

Ok, so enough introduction. Let's talk about the code. First, any machine that will participate as a remote "node" will need 
WinRM enabled for remote access, as shown below. This is not exactly practical for hundreds of intended nodes, but for one (or five) 
machines in a test environment it does just fine. 

    C:> winrm quickconfig
    WinRM is not set up to receive requests on this machine.
    The following changes must be made:

    Set the WinRM service type to auto start.
    Start the WinRM service.

    Make these changes [y/n]? y

Alternatively, you could take the approach described in the [Remotely enable PSRemoting post](http://social.technet.microsoft.com/Forums/en-US/winserverpowershell/thread/0800c68c-8cfb-4d6f-9c05-0e1a33412941/) 
from the TechNet forum and use PowerShell to create remote scheduled tasks that will call [Enable-PSRemoting](http://technet.microsoft.com/en-us/library/dd819498.aspx) on each intended node.

Invoke-MapRedux
---------------
Moving on, now that you have one or more remote "nodes" enabled, you can consider the actual Map and Reduce algorithms. Consider the following snippet:

{% highlight powershell linenos %}
    $MyMrResults = Invoke-MapRedux -MapReduceItem $Mr -ComputerName $MyNodes -DataSet $dataset -Verbose
{% endhighlight %}

`Invoke-MapRedux` takes an instance of a MapReduceItem which references the Map and Reduce scriptblocks, an array of computer names which 
are the remote nodes, and the initial data set to be processed. As simple as that, you can start working with concepts of big data 
and the MapReduce paradigm. Now, how did we get there? 
