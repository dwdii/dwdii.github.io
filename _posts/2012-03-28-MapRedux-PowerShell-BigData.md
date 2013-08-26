---
layout: post
title: MapRedux – #PowerShell and #Big Data
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

Invoke-MapRedux takes an instance of a MapReduceItem which references the Map and Reduce scriptblocks, an array of computer names which 
are the remote nodes, and the initial data set to be processed. As simple as that, you can start working with concepts of big data 
and the MapReduce paradigm. Now, how did we get there? 

I have published the initial version of my [PsMapRedux PowerShell Module on GitHub](https://github.com/dwdii/PsMapRedux). The PsMapRedux module provides the Invoke-MapRedux function 
described above. Feel free to browse the underlying code and even contribute to the project! In a later post, I plan to show some of the 
inner workings of the module, but for now let's move on to how the Map and Reduce functions are defined. 

Map
---
Both the Map and Reduce functions need to follow a prescribed prototype. The prototype for a Map function in the MapRedux module is as follows. 
A simple scriptblock that takes one PsObject parameter and returns a hashtable. It is important to note that the PsObject `$dataset` parameter is a 
MapRedux custom object that has a "Data" property which offers an array of data to be processed by the Map function.

{% highlight powershell linenos %}
    $aMap = 
    {
            Param
            (
                [PsObject] $dataset
            )

            # Indicate the job is running on the remote node.
            Write-Host ($env:computername + "::Map");

            # The hashtable to return
            $list = @{};

            # ... Perform the mapping work and prepare the $list hashtable result with your custom PSObject...
            # ... The $dataset has a single 'Data' property which contains an array of data rows 
            #     which is a subset of the originally submitted data set.

            # Return the hashtable (Key, PSObject)
            Write-Output $list;
     }
{% endhighlight %}

Reduce
------
Likewise, with the Reduce function a simple prototype must be followed which takes a `$key` and a result `$dataset` from the MapRedux's 
partitioning function (which joins the Map results by key). Again, the $dataset is a MapRedux custom object that has a "Data" property as 
described in the Map section.

{% highlight powershell linenos %}
     $aReduce =
     { 
            Param
            (
                [object] $key,

                [PSObject] $dataset
            )

            Write-Host ($env:computername + "::Reduce - Count: " + $dataset.Data.Count)

            # The hashtable to return
            $redux = @{};

            # Return    
            Write-Output $redux;
    }
{% endhighlight %}

All Together Now
----------------
When everything is put together in a short example script, you implement your Map and Reduce functions, query for some starting data, 
build the MapReduxItem via New-MapReduxItem and call Invoke-MapRedux to get the process started:

{% highlight powershell linenos %}
    # Import the MapRedux and SQL Server providers
    Import-Module "MapRedux"
    Import-Module “sqlps” -DisableNameChecking

    # Query the database for a dataset
    Set-Location SQLSERVER:\sql\dbserver1\default\databases\myDb
    $query = "SELECT MyKey, Date, Value1 FROM BigData ORDER BY MyKey";
    Write-Host "Query: $query"
    $dataset = Invoke-SqlCmd -query $query

    # Build the Map function
    $MyMap =
    { 
        Param
        (
            [PsObject] $dataset
        )

        Write-Host ($env:computername + "::Map");

        $list = @{};
        foreach($row in $dataset.Data)
        {
            # Write-Host ("Key: " + $row.MyKey.ToString());
            if($list.ContainsKey($row.MyKey) -eq $true)
            {
                $s = $list.Item($row.MyKey);
                $s.Sum += $row.Value1;
                $s.Count++;
            }
            else
            {
                $s = New-Object PSObject;
                $s | Add-Member -Type NoteProperty -Name MyKey -Value $row.MyKey;
                $s | Add-Member -type NoteProperty -Name Sum -Value $row.Value1;
                $list.Add($row.MyKey, $s);
            }
        }

        Write-Output $list;
    }

    $MyReduce =
    { 
        Param
        (
            [object] $key,

            [PSObject] $dataset
        )

        Write-Host ($env:computername + "::Reduce - Count: " + $dataset.Data.Count)

        $redux = @{};
        $count = 0;
        foreach($s in $dataset.Data)
        {
            $sum += $s.Sum;
            $count += 1;
        }

        # Reduce
        $redux.Add($s.MyKey, $sum / $count);

        # Return    
        Write-Output $redux;
    }


    # Create the item data
    $Mr = New-MapReduxItem "My Test MapReduce Job" $MyMap $MyReduce 

    # Array of processing nodes...      
    $MyNodes = ("node1",  
                "node2",  
                "node3", 
                "node4", 
                "localhost")

    # Run the Map Reduce routine...
    $MyMrResults = Invoke-MapRedux -MapReduceItem $Mr -ComputerName $MyNodes -DataSet $dataset -Verbose

    # Show the results
    Set-Location C:\
    $MyMrResults | Out-GridView
{% endhighlight %}

Conclusion
----------
I hope you have seen through this article that PowerShell has a significant infrastructure available for distributed computing. While 
it does take some code to expose a MapReduce-style framework, much of the work is already done and PowerShell could prove to be the the 
easiest platform to develop and run big data jobs in your corporate data center, potentially in the Azure cloud, or certainly as an 
academic excerise at home or school. 

Follow me on Twitter to stay up to date on the continuing progress of my Powershell MapRedux module, and thanks for reading!

[Daniel (@dwdii)](http://twitter.com/dwdii)
