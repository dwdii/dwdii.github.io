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
2. Create Partition Scheme
3. Create Schema
4. Create Filegroup(s) within which the partitioned table will reside.
5. Create Partitioned Table within the Schema from step 3 and on the partition scheme from step 2.

I will quickly go through these steps in the following T-SQL inorder to set the stage for the area I want to focus on,
which is the actual data loading phase of partitioned tables. 

### The Data Description ###

Below is a simple partition function that starts off with a single boundary at zero. Given the `RANGE RIGHT`, this means 
that all negative numbers are in the left-most partitionm, and zero starts the right most partition initially. 

{% highlight sql linenos %}
    CREATE PARTITION FUNCTION PF1_Right (bigint) AS RANGE RIGHT FOR VALUES (0);
{% endhighlight %}


Some articles I found useful:
* [Partitioned Tables and Indexes] (http://technet.microsoft.com/en-us/library/ms190787.aspx)
* [Transferring Data Efficiently by Using Partition Switching](http://technet.microsoft.com/en-us/library/ms191160%28v=sql.105%29.aspx)

Hope this helps you!

[Daniel (@dwdii)](http://twitter.com/dwdii)
