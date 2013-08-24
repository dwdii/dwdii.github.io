---
layout: post
title: Part 2 - Automating a Visual Studio Build with PowerShell  
tags: PowerShell VisualStudio MSBuild
---
{{ page.title }}
-------------------------------------------------
In [my prior blog post on this topic](/2011/05/20/Automating-a-Visual-Studio-Build-with-PowerShell-Part-1.html), I showed how to use the PowerShell `Start-Process` 
command to initiate the rebuild of a Visual Studio solution using MSBUILD. With today's post, I'll show how I've wrapped this call into a PowerShell function to 
make it more PowerShell friendly.

As I mentioned last time, the wrapper function's name is 'Build-VisualStudioSolution'. I know, I know... "Build" is not an approved verb. I decided it was the 
most appropriate verb for this function given the intent and circumstances. It is the verb of choice in Visual Studio and for a PowerShell function which 
performs an individual build, I hope even PowerShell gurus agree it is the best choice.

Anyway, I've listed the code for this function below. Please note a couple of things:

* `$SolutionFile` - This is a relative path to the solution file... but if you don't specify anything for `$SourceCodePath` then it would need to be the 
full absolute path to the solution file.
* v2.0.50727 - Again, I'm using .Net Framework v2 for my work, but this could easily be updated for v3.5 or v4.
* `$ClearFirst` - Part of my configuration management process is to perform a clean before a rebuild. This may be redundant to some. The function will 
skip the inital cleaning automatically if the -CleanFirst flag is omitted when calling the function.
* `$BuildLogOutputPath` - Build log output defaults to the current user's desktop.

This function fits into a module which is still in draft, so if you have any feedback or suggestions, please post some comments. Thanks, and enjoy!

{% highlight powershell linenos %}

function Build-VisualStudioSolution            
{            
    param            
    (            
        [parameter(Mandatory=$false)]            
        [ValidateNotNullOrEmpty()]             
        [String] $SourceCodePath = "C:\SourceCode\Development\",            
            
        [parameter(Mandatory=$false)]            
        [ValidateNotNullOrEmpty()]             
        [String] $SolutionFile,            
                    
        [parameter(Mandatory=$false)]            
        [ValidateNotNullOrEmpty()]             
        [String] $Configuration = "Debug",            
                    
        [parameter(Mandatory=$false)]            
        [ValidateNotNullOrEmpty()]             
        [Boolean] $AutoLaunchBuildLog = $false,            
            
        [parameter(Mandatory=$false)]            
        [ValidateNotNullOrEmpty()]             
        [Switch] $MsBuildHelp,            
                    
        [parameter(Mandatory=$false)]            
        [ValidateNotNullOrEmpty()]             
        [Switch] $CleanFirst,            
                    
        [ValidateNotNullOrEmpty()]             
        [string] $BuildLogFile,            
               
	[ValidateNotNullOrEmpty()]                  
        [string] $BuildLogOutputPath = $env:userprofile + "\Desktop\"            
    )            
                
    process            
    {            
        # Local Variables            
        $MsBuild = $env:systemroot + "\Microsoft.NET\Framework\v2.0.50727\MSBuild.exe";            
                
        # Caller requested MsBuild Help?            
        if($MsBuildHelp)            
        {            
                $BuildArgs = @{            
                    FilePath = $MsBuild            
                    ArgumentList = "/help"            
                    Wait = $true            
                    RedirectStandardOutput = "C:\MsBuildHelp.txt"            
                }            
            
                # Get the help info and show            
                Start-Process @BuildArgs            
                Start-Process -verb Open "C:\MsBuildHelp.txt";            
        }            
        else            
        {            
            # Local Variables            
            $SlnFilePath = $SourceCodePath + $SolutionFile;            
            $SlnFileParts = $SolutionFile.Split("\");            
            $SlnFileName = $SlnFileParts[$SlnFileParts.Length - 1];            
            $BuildLog = $BuildLogOutputPath + $BuildLogFile            
            $bOk = $true;            
                        
            try            
            {            
                # Clear first?            
                if($CleanFirst)            
                {            
                    # Display Progress            
                    Write-Progress -Id 20275 -Activity $SlnFileName  -Status "Cleaning..." -PercentComplete 10;            
                            
                    $BuildArgs = @{            
                        FilePath = $MsBuild            
                        ArgumentList = $SlnFilePath, "/t:clean", ("/p:Configuration=" + $Configuration), "/v:minimal"            
                        RedirectStandardOutput = $BuildLog            
                        Wait = $true            
                        #WindowStyle = "Hidden"            
                    }            
            
                    # Start the build            
                    Start-Process @BuildArgs #| Out-String -stream -width 1024 > $DebugBuildLogFile             
                                
                    # Display Progress            
                    Write-Progress -Id 20275 -Activity $SlnFileName  -Status "Done cleaning." -PercentComplete 50;            
                }            
            
                # Display Progress            
                Write-Progress -Id 20275 -Activity $SlnFileName  -Status "Building..." -PercentComplete 60;            
                            
                # Prepare the Args for the actual build            
                $BuildArgs = @{            
                    FilePath = $MsBuild            
                    ArgumentList = $SlnFilePath, "/t:rebuild", ("/p:Configuration=" + $Configuration), "/v:minimal"            
                    RedirectStandardOutput = $BuildLog            
                    Wait = $true            
                    #WindowStyle = "Hidden"            
                }            
            
                # Start the build            
                Start-Process @BuildArgs #| Out-String -stream -width 1024 > $DebugBuildLogFile             
                            
                # Display Progress            
                Write-Progress -Id 20275 -Activity $SlnFileName  -Status "Done building." -PercentComplete 100;            
            }            
            catch            
            {            
                $bOk = $false;            
                Write-Error ("Unexpected error occurred while building " + $SlnFileParts[$SlnFileParts.Length - 1] + ": " + $_.Message);            
            }            
                        
            # All good so far?            
            if($bOk)            
            {            
                #Show projects which where built in the solution            
                #Select-String -Path $BuildLog -Pattern "Done building project" -SimpleMatch            
                            
                # Show if build succeeded or failed...            
                $successes = Select-String -Path $BuildLog -Pattern "Build succeeded." -SimpleMatch            
                $failures = Select-String -Path $BuildLog -Pattern "Build failed." -SimpleMatch            
                            
                if($failures -ne $null)            
                {            
                    Write-Warning ($SlnFileName + ": A build failure occurred. Please check the build log $BuildLog for details.");            
                }            
                            
                # Show the build log...            
                if($AutoLaunchBuildLog)            
                {            
                    Start-Process -verb "Open" $BuildLog;            
                }            
            }            
        }            
    }            
                
    <#
        .SYNOPSIS
        Executes the v2.0.50727\MSBuild.exe tool against the specified Visual Studio solution file.
        
        .Description
        
        .PARAMETER SourceCodePath
        The source code root directory. $SolutionFile can be relative to this directory. 
        
        .PARAMETER SolutionFile
        The relative path and filename of the Visual Studio solution file.
        
        .PARAMETER Configuration
        The project configuration to build within the solution file. Default is "Debug".
        
        .PARAMETER AutoLaunchBuildLog
        If true, the build log will be launched into the default viewer. Default is false.
        
        .PARAMETER MsBuildHelp
        If set, this function will run MsBuild requesting the help listing.
        
        .PARAMETER CleanFirst
        If set, this switch will cause the function to first run MsBuild as a "clean" operation, before executing the build.
        
        .PARAMETER BuildLogFile
        The name of the file which will contain the build log after the build completes.
        
        .PARAMETER BuildLogOutputPath
        The full path to the output folder where build log files will be placed. Defaults to the current user's desktop.
        
        .EXAMPLE
        
        .LINK
        http://stackoverflow.com/questions/2560652/why-does-powershell-fail-to-build-my-net-solutions-file-is-being-used-by-anot
        http://geekswithblogs.net/dwdii
        
        .NOTES
        Name:   Build-VisualStudioSolution
        Author: Daniel Dittenhafer
    #>                
}

{% endhighlight %}

Thanks for reading!

[Daniel (@dwdii)](http://twitter.com/dwdii)
