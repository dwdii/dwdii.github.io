---
layout: post
title: How to Get Error Exception Details in PowerShell Catch Block
tags: PowerShell Exceptions
---
{{ page.title }}
-------------------------------------------------
For the last couple of weeks I have been required to import a data log file (CSV) from a legacy SCADA system into my centralized 
data management system. It occured to me today that I might be able to use PowerShell to automate some of the importing steps 
which include import to a DEV, QA and Production system. I'm still working on this script, but in the process of developing it, I 
had a need to learn more about an exception that was occuring in the script. I had my try catch block already specified, but was simply 
using `Write-Error`, as in the following code sample, to report a generic message "Failed to..." whenever the catch block was executed.

{% highlight powershell linenos %}
try 
{ 
	$session = Logon... 
} 
catch 
{ 
	Write-Error "Failed to logon to DMS." 
} 
{% endhighlight %}

I searched the local PowerShell help and didn't see any info on how to get more detail about a given exception. I searched a little online 
including [about_Try_Catch_Finally](http://technet.microsoft.com/en-us/library/dd315350.aspx) and didn't find any gems. Then I thought 
"Maybe there is a global object, like `$host`, that as some error info". I tried $Err and $Error with no success... then I tried `$_` 
and surprise! It resulted in an object with exception details! See the code sample below, where the `$_` object is used in the catch 
block and converted to a string for output to the `Write-Error` stream.

{% highlight powershell linenos %}
try
{
    $session = Logon...
}
catch
{
    # Using $_ in the catch block to include more details about the error that occured.
    Write-Error ("Failed to logon to DMS." + $_)
}
{% endhighlight %}

When I run through `Get-Member`, the `$_` object in the catch block returns the following result:

<table class="PoshGetMember">
	<tr>
		<th colspan="3">TypeName: System.Management.Automation.ErrorRecord</th>
	</tr>
	<tr>
		<th align="left">Name</th>
		<th align="left">MemberType</th>
		<th align="left">Definition</th>
	</tr>
	<tr>
		<td>Equals</td>
		<td>Method</td>
		<td>bool Equals(System.Object obj)</td>
	</tr>
	<tr>
		<td>GetHashCode</td>
		<td>Method</td>
		<td>int GetHashCode()</td>
	</tr>
	<tr>
		<td>GetObjectData</td>
		<td>Method</td>
		<td>System.Void GetObjectData(System.Runtime.Serialization.SerializationInfo info, System.Runtime.Serialization.StreamingContext context)</td>
	</tr>
	<tr>
		<td>GetType</td>
		<td>Method</td>
		<td>type GetType()</td>
	</tr>
	<tr>
		<td>ToString</td>
		<td>Method</td>
		<td>string ToString()</td>
	</tr>
	<tr>
		<td>CategoryInfo</td>
		<td>Property</td>
		<td>System.Management.Automation.ErrorCategoryInfo CategoryInfo {get;}</td>
	</tr>
	<tr>
		<td>ErrorDetails</td>
		<td>Property</td>
		<td>System.Management.Automation.ErrorDetails ErrorDetails {get;set;}</td>
	</tr>
	<tr>
		<td>Exception</td>
		<td>Property</td>
		<td>System.Exception Exception {get;}</td>
	</tr>
	<tr>
		<td>FullyQualifiedErrorId</td>
		<td>Property</td>
		<td>System.String FullyQualifiedErrorId {get;}</td>
	</tr>
	<tr>
		<td>InvocationInfo</td>
		<td>Property</td>
		<td>System.Management.Automation.InvocationInfo InvocationInfo {get;}</td>
	</tr>
	<tr>
		<td>PipelineIterationInfo</td>
		<td>Property</td>
		<td>System.Collections.ObjectModel.ReadOnlyCollection'1[[System.Int32, mscorlib, 
										 Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]] 
										 PipelineIterationInfo {get;}</td>
	</tr>
	<tr>
		<td>TargetObject</td>
		<td>Property</td>
		<td>System.Object TargetObject {get;}</td>
	</tr>
	<tr>
		<td>PSMessageDetails</td>
		<td>ScriptProperty</td>
		<td>System.Object PSMessageDetails {get=&amp; { Set-StrictMode -Version 1; 
										 $this.Exception.InnerException.PSMessageDetails };}</td>
	</tr>
</table>

Of course, after having figured this out, I thought "Hmm... I bet others might have the same question about 
getting more exception detail inside a catch block", and so was born this blog entry. Hope it helps!

Thanks for reading!

[Daniel (@dwdii)](http://twitter.com/dwdii)
