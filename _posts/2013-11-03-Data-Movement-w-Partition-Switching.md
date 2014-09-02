---
layout: post
title: Data Movement with Partition Switching in SQL Server
tags: SQL Server, Data Warehouse, Partition Switching
---
{{ page.title }}
----------------
This post is a follow-on to my prior "part 1" post [Table Partitioning in SQL Server](/2013/09/12/SQL-Server-Table-Partitioning.html)
where I introduced the topic and laid-out the data definition which will be the basis for this post on data movement with partition switching in SQL Server.

The process of data movement with partition switching is mentioned in many articles as a seemingly simple operation invoked via a variant of the `ALTER TABLE` 
statement. Generally, this is true, but in practice, I have found several key steps which are often not addressed in the average partition switching article.
In this post, I hope to shine more light on the real meat of partition switching in a more real world scenario. 

In my "real world scenario", as mentioned in the [part 1 post](/2013/09/12/SQL-Server-Table-Partitioning.html), we have a parent table with a one to many relationship
with a partitioned child table containing a foreign key back to the parent. As shown in the DDL from part 1, both tables have identity columns which are the primary keys as well.
The identity column on the partitioned child table complicates the data movement, but I'll show a solution based in part on the `DBCC CHECKIDENT` suggestion from 
[Transferring Data Efficiently by Using Partition Switching](http://technet.microsoft.com/en-us/library/ms191160%28v=sql.105%29.aspx).

### The Data Movement - Phase 1 ###
To begin with, given the parent table in our scenario, we start with a simple insert. For simplicity, the parent table includes
only an identity column and the timestamp, but could easily contain any additional columns you might need.

{% highlight sql linenos %}
DECLARE @ParentID BIGINT

-- ParentTable insert
INSERT INTO [DWD].[ParentTable] ([Timestamp]) VALUES (GETUTCDATE());

-- Get the parent key for use during the data loading.
SET @ParentID = SCOPE_IDENTITY();
{% endhighlight %}

Next, we have to deal with the child identity challenge. Rather than use `DBCC CHECKIDENT` I've chosen to use the 
[IDENT_CURRENT](http://technet.microsoft.com/en-us/library/ms175098.aspx) function. Keep in mind that this data
movement must run serially, pipeline-style, and cannot have multiple instances executing this same SQL concurrently.

{% highlight sql linenos %}
DECLARE @DestPartition INT
DECLARE @IdentCurrent BIGINT
DECLARE @StageIdentCurrent BIGINT
DECLARE @NewIdentStage BIGINT

SET @DestPartition = (SELECT $PARTITION.PF1_Right(@ParentID));
SET @IdentCurrent = (IDENT_CURRENT('[DWD].[ChildPartitionedTable]'));
SET @NewIdentStage = @IdentCurrent + 1

-- Reseed the staging table so we keep the IDENTITY up to date.
DBCC CHECKIDENT ('[DWD].[ChildPartitionedTable_Stage]', RESEED, @NewIdentStage) WITH NO_INFOMSGS
{% endhighlight %}

1. First, we call the partitioning function (line 6) to determine the destination partition for the given partitioning key.
2. Call IDENT_CURRENT on the partitioned child table to get the last allocated IDENTITY value.
3. Increment the IDENTITY value.
4. Finally, re-seed the staging table to match the partitioned child table's next IDENTITY value.

If you are playing along on your side, you can run the following statements to verify where things stand. In development, I use these statements 
to make sure things are proceeding as expected in my stored proc.

{% highlight sql linenos %}
SET @StageIdentCurrent = (IDENT_CURRENT('[DWD].[ChildPartitionedTable_Stage]'));
SELECT [ParentID] = @ParentID, [DestPartition] = @DestPartition, [IDENT_CURRENT] = @IdentCurrent, [Stage_IDENT_CURRENT] = @StageIdentCurrent;
{% endhighlight %}

Next, we prep the staging table by dropping old constraints so we can add revised constraints after data load. These constraints are logistical best practices
to ensure, with the help of SQL Server, our staging data is in bounds for the partition switch coming up soon.

{% highlight sql linenos %}
-- Stage Table: Drop the CHECK constraint and PK on staging table
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[DWD].PK_ChildPartitionedTable_Stage_ID') AND type in (N'PK'))
BEGIN
	ALTER TABLE [DWD].[ChildPartitionedTable_Stage] DROP CONSTRAINT PK_ChildPartitionedTable_Stage_ID  
END

IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[DWD].CheckRange_ChildPartitionedTable_Stage_ParentTable_ID') AND type in (N'C'))
BEGIN
	ALTER TABLE [DWD].[ChildPartitionedTable_Stage] DROP CONSTRAINT CheckRange_ChildPartitionedTable_Stage_ParentTable_ID  
END
{% endhighlight %}

Here is the data load. For demonstration purposes, I'm selecting data from the [AdventureWorks2012 database](http://msftdbprodsamples.codeplex.com/releases/view/55330), 
but in practice I would use a bulk insert via the .NET Framework's SQLBulkCopy class, SSIS, or some other bulk insert option.

{% highlight sql linenos %}
-- Bulk load into staging table 
INSERT INTO [DWD].[ChildPartitionedTable_Stage] (ParentTable_ID,Timestamp,Description) 
	SELECT @ParentID, GETUTCDATE(), CarrierTrackingNumber FROM AdventureWorks2012.Sales.SalesOrderDetail;
{% endhighlight %}

Next, we add our primary key onto the staging table to facilitate lookups and constraint checking

{% highlight sql linenos %}
ALTER TABLE [DWD].[ChildPartitionedTable_Stage] ADD 
	CONSTRAINT PK_ChildPartitionedTable_Stage_ID
				PRIMARY KEY CLUSTERED (ID, ParentTable_ID)
				WITH (IGNORE_DUP_KEY = OFF)
{% endhighlight %}

As mentioned earlier, a partition switching best practice is to add a check constraint on the staging table to ensure only new partition values are present. Additionally,
we update the check constraint on the destination table to verify we are in partition range and no existing rows would fall in the 
new parition range. Our '6' comes from the new Parent_ID allocated during the ParentTable insert (`@ParentID` from line 7 of the first code block, above). 
ParentTable_ID is the key for our partitioning function. The range 0 - 6 is hardcoded due to `ALTER TABLE` requiring constants, so this would be an sp_executesql 
call or implemented in application code executed via the .NET SqlCommand class.

{% highlight sql linenos %}
-- Best practice to add the check constraint on the staging table after the primary index
IF  NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[DWD].CheckRange_ChildPartitionedTable_Stage_ParentTable_ID') AND type in (N'C'))
BEGIN
	ALTER TABLE [DWD].[ChildPartitionedTable_Stage] ADD CONSTRAINT CheckRange_ChildPartitionedTable_Stage_ParentTable_ID CHECK (6 = ParentTable_ID)
END

ALTER TABLE [DWD].[ChildPartitionedTable] DROP CONSTRAINT CheckRange_ChildPartitionedTable_ParentTable_ID  
ALTER TABLE [DWD].[ChildPartitionedTable] ADD CONSTRAINT CheckRange_ChildPartitionedTable_ParentTable_ID CHECK (ParentTable_ID >= 0 AND 6 > ParentTable_ID) 
{% endhighlight %}

Again, the '6' comes in when the partition function is altered to split the boundary at 6 to effectively create the new partition.

{% highlight sql linenos %}
ALTER PARTITION SCHEME PS1_Right NEXT USED FgSandbox2;
ALTER PARTITION FUNCTION PF1_Right () SPLIT RANGE (6);
{% endhighlight %}

Finally, the actual `ALTER TABLE ... SWITCH TO` statement which performs the data movement from the staging table to the paritioned destination table.

{% highlight sql linenos %}
-- Do the meta-data switch op 
ALTER TABLE [DWD].[ChildPartitionedTable_Stage]
	SWITCH TO [DWD].[ChildPartitionedTable] PARTITION $PARTITION.PF1_Right(6) 
{% endhighlight %}

I realize I moved fairly quickly through this article, but I hope it will help show (in a slightly more concrete way) how partition switching can be used 
to load large volumes of data efficiently. 

Some articles I found useful:

* [Partitioned Tables and Indexes](http://technet.microsoft.com/en-us/library/ms190787.aspx)
* [Transferring Data Efficiently by Using Partition Switching](http://technet.microsoft.com/en-us/library/ms191160%28v=sql.105%29.aspx)

Best,

[Daniel (@dwdii)](http://twitter.com/dwdii)
