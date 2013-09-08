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

Next, we'll create a filegroup for the physical storage of the partitioned table. It is optional (you could use the default PRIMARY filgroup), but recommended. 
At least the initial filegroup must exist before the partition scheme can be defined. Below are two simple [ALTER DATABASE](http://technet.microsoft.com/en-US/library/bb522469.aspx) 
statements to add a filegroup named "FgSandbox2" to the Sandbox database (change the name from Sandbox to your database name), and then adding a physical 
file named Sandbox2.ndf to the filegroup (change the database name and path as necessary). 

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

Although not specifically required for partitioning, it is a best practice to create and use a non-dbo schema for encapsulating tables.
The [CREATE SCHEMA](http://technet.microsoft.com/en-us/library/ms189462.aspx) statement below creates a new schema named 'DWD' (my initials). 
The partition scheme and function created earlier are not (can't be) assigned a schema, but  shortly we will be creating the the partitioned 
table and it can and shout be assigned to our non-dbo schema.

{% highlight sql linenos %}
	CREATE SCHEMA [DWD];
{% endhighlight %}

Next, we'll create a series of tables. As mentioned earlier, my scenario involves a partitioned child table with a foreign key to a 
non-partitined parent table. This obviously means creating 2 tables here, and because my goal is to show parition switching from
a staging table, we'll create this table as well.

First, the parent table... for simplicity it includes only the primary key identity column (ID), and a timestamp for informational purposes.

{% highlight sql linenos %}
	CREATE TABLE [DWD].[ParentTable]
	(
		ID BIGINT NOT NULL IDENTITY (1,1) CONSTRAINT PK_ParentTable_ID PRIMARY KEY CLUSTERED,
		Timestamp DATETIME NOT NULL
	);
{% endhighlight %}

Next is the actual partitioned table. As mentioned, this table has a foreign key to the parent table. In addition, we have a 
primary key identity column, in keeping with our 'real world' scenario, and again information columns timestamp and description.

Take note of the `ON` clause at the end of the statement. It indicates that the table will be using the partition scheme PS1_Right,
based ont he ParentTable_ID to determine partition into which a given row is stored.

{% highlight sql linenos %}
	CREATE TABLE [DWD].[ChildPartitionedTable]
	(
		ID BIGINT NOT NULL IDENTITY(1,1),
		ParentTable_ID BIGINT NOT NULL CONSTRAINT FK_ChildPartitionedTable_ParentTable_ID FOREIGN KEY REFERENCES [DWD].[ParentTable](ID),
		Timestamp SMALLDATETIME NOT NULL,
		Description NVARCHAR(100) NULL,

		CONSTRAINT PK_ChildPartitionedTable_ID
				   PRIMARY KEY CLUSTERED (ID, ParentTable_ID)
				   WITH (IGNORE_DUP_KEY = OFF),

		CONSTRAINT CheckRange_ChildPartitionedTable_ParentTable_ID CHECK (ParentTable_ID >= 0 AND 20 >= ParentTable_ID) 
	)
	ON PS1_Right ( ParentTable_ID );
{% endhighlight %}


Some articles I found useful:
* [Partitioned Tables and Indexes] (http://technet.microsoft.com/en-us/library/ms190787.aspx)
* [Transferring Data Efficiently by Using Partition Switching](http://technet.microsoft.com/en-us/library/ms191160%28v=sql.105%29.aspx)

Hope this helps you!

[Daniel (@dwdii)](http://twitter.com/dwdii)
