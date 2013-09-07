---
layout: post
title: Partition Switching in SQL Server
tags: SQL Server, Data Warehouse
---
{{ page.title }}
----------------
Very large tables can be a bear to load, query and archive. How is "very large table" defined? Usually in hundreds of gigabytes or terabytes.
Regardless, if you have a given table which is so large as to be causing maintenance or query bottlenecks, you might benefit from table partitioning.

I my 'real world' scenario, I have a parent table which is not very large, but a child table which is expected to receive a minimum of 100,000 rows/day
(likely 10x that). This constitutes a very large table for us and will certainly benefit from table partitioning both in the loading and querying aspects.

There are many articles that cover the basic steps (listed below) of creating a partitioned table. The [Partitioned Tables and Indexes] (http://technet.microsoft.com/en-us/library/ms190787.aspx)
article from Microsoft TechNet is a good example.

1. Create Partition Function
2. Create Filegroup(s) within which the partitioned table will reside.
3. Create Partition Scheme
4. Create Schema
5. Create Partitioned Table within the Schema from step 3 and on the partition scheme from step 2.

I will quickly go through these steps in the following T-SQL inorder to set the stage for the area I want to focus on,
which is the actual data loading phase of partitioned tables. 

### The Data Description ###

Below is a simple [CREATE PARTITION FUNCTION](http://technet.microsoft.com/en-us/library/ms187802.aspx) statement that starts off 
with a single boundary at zero. Given the `RANGE RIGHT`, this means that all negative numbers are in the left-most partition, and 
zero starts the right most partition initially. 

{% highlight sql linenos %}
    CREATE PARTITION FUNCTION PF1_Right (bigint) AS RANGE RIGHT FOR VALUES (0);
{% endhighlight %}

You can this partition function using the '$PARTITION' database object as shown below, which will return `2` indicating
that the key value of zero will be stored in the 2nd partition.

{% highlight sql linenos %}
	SELECT $PARTITION.PF1_Right(0);
{% endhighlight %}

Next, we'll create a filegroup for the physical storage of the partitioned table. It is optional, but recommended. At least the initial filegroup
must exist before the partition scheme can be defined. Below are two simple ALTER DATABASE statements to add a filegroup named "FgSandbox2" to the Sandbox
database (change the name from Sandbox to your database name), and then adding a physical file named Sandbox2.ndf to the filegroup (change the path as necessary). 

{% highlight sql linenos %}
	ALTER DATABASE Sandbox 
		ADD FILEGROUP FgSandbox2;

	ALTER DATABASE Sandbox
		ADD FILE 
		(
			Name = Sandbox2,
			FILENAME = 'D:\Databases\MSSQL11.MSSQLSERVER\Data\Sandbox2.ndf',
			SIZE = 50 MB,
			MAXSIZE = UNLIMITED,
			FILEGROWTH = 10 %
		)
		TO FILEGROUP FgSandbox2
{% endhighlight %}

Below, the [CREATE PARTITION SCHEME](http://technet.microsoft.com/en-us/library/ms179854.aspx) statement is used to create the 
partitioning scheme which will be assigned to the table. The `ALL TO` syntax is used to specify that the FgSandbox2 filegroup
will be used for all partitions of the partitioned table.

{% highlight sql linenos %}
	CREATE PARTITION SCHEME PS1_Right
		AS PARTITION PF1_Right
		ALL TO (FgSandbox2);
{% endhighlight %}


Some articles I found useful:
* [Partitioned Tables and Indexes] (http://technet.microsoft.com/en-us/library/ms190787.aspx)
* [Transferring Data Efficiently by Using Partition Switching](http://technet.microsoft.com/en-us/library/ms191160%28v=sql.105%29.aspx)

Hope this helps you!

[Daniel (@dwdii)](http://twitter.com/dwdii)
