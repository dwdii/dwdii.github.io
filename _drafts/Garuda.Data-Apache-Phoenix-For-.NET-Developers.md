---
layout: post
title: Garuda.Data - Apache Phoenix for .NET Developers
tags: Apache,Phoenix,Garuda,Big Data
keywords: Apache,Phoenix,Garuda,Big Data,HBase
---
{{ page.title }}
----------------
On June 20, 2016, Microsoft released a preview of their [Microsoft.Phoenix.Client](https://www.nuget.org/packages/Microsoft.Phoenix.Client/) 
on Nuget.org. This package provides a .NET framework compatible collection
of classes to interface with the [Apache Phoenix Query Server](https://phoenix.apache.org/) for [Apache HBase](https://hbase.apache.org/). 
I had been evaluating Phoenix and HBase in the prior weeks and the release of the .NET client library was very interesting to me. It was the only
.NET compatible client I was aware of and I immediately began experimenting with it.

As I began learning how to use the Microsoft.Phoenix.Client, I noticed the use of [Google Protocol Buffers](https://developers.google.com/protocol-buffers/)
and discovered the underlying wire protocol relied on Protocol Buffers also. As it turns our Apache Phoenix uses 
[Apache Calcite](https://calcite.apache.org/), and specifically [Avatica](https://calcite.apache.org/avatica/), 
at the network layer to facilitate the Java Database Connectivity (JDBC) interface.

The [Microsoft.Phoenix.Client's project site](https://github.com/Azure/hdinsight-phoenix-sharp), hosted on GitHub, has some great examples 
of using the `PhoenixClient`. I also found [duoxo's](https://github.com/duoxu) [tweet-sentiment-phoenix](https://github.com/duoxu/tweet-sentiment-phoenix)
project to have some great examples. As I worked though my first use case, I was missing the good old 
[IDbConnection](https://msdn.microsoft.com/en-us/library/system.data.idbconnection(v=vs.110).aspx) et al paradigm implemented for so many
relational database providers. SqlConnection, OracleConnection, etc. Wouldn't it be great if there was a PhoenixConnection?

With a resounding "yes!", I started the `PhoenixConnection` class, which led to the `PhoenixCommand` and then `PhoenixDataReader` classes. 
Along with these classes came the familiar `ConnectionString` property on the `PhoenixConnection` class. After working through most of the
interfaces, it became possible for me to open a connection to Apache Phoenix and execute queries from my code in a manner virtually every .NET 
developer is familiar with:

{% highlight csharp %}
using (IDbConnection phConn = new PhoenixConnection())
{
    phConn.ConnectionString = cmdLine.ConnectionString;

    phConn.Open();

    using (IDbCommand cmd = phConn.CreateCommand())
    {
        cmd.CommandText = "SELECT * FROM GARUDATEST";
        using (IDataReader reader = cmd.ExecuteReader())
        {
            while(reader.Read())
            {
                for(int i = 0; i < reader.FieldCount; i++)
                {
                    Console.WriteLine(string.Format("{0}: {1}", reader.GetName(i), reader.GetValue(i)));
                }
            }
        }
    }                        
}
{% endhighlight %}

It seemed apparent that these APIs would be useful to other .NET developers who needed to interface with big data stored
in Apache Phoenix/HBase. I decided to prepare a Nuget package which I named Garuda.Data, after 
[the mythical bird from Hindu and Buddhist traditions, the Garuda](https://en.wikipedia.org/wiki/Garuda), and uploaded an
early "alpha" version to nuget.org in late July.

<center>
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Query Apache Phoenix+Hbase from <a href="https://twitter.com/hashtag/dotnet?src=hash">#dotnet</a> just like <a href="https://twitter.com/hashtag/sqlserver?src=hash">#sqlserver</a>, using Garuda.Data. <a href="https://t.co/gL2mJboGmR">https://t.co/gL2mJboGmR</a> <a href="https://twitter.com/hashtag/Hadoop?src=hash">#Hadoop</a> <a href="https://t.co/mOqMoMwyiF">pic.twitter.com/mOqMoMwyiF</a></p>&mdash; Daniel Dittenhafer (@dwdii) <a href="https://twitter.com/dwdii/status/757421008622149633">July 25, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</center>

The Garuda.Data package has been updated several times since the original alpha release. As of the time of this writing, it is in beta (v0.5.6067.42547)
and includes:

* `PhoenixBulkCopy` class which takes advantage of the 
[ExecuteBatchRequest](https://calcite.apache.org/avatica/docs/protobuf_reference.html#executebatchrequest) mechanism for more
efficient inserts/updates (UPSERTS in Phoenix SQL). 
* `PhoenixTransaction` class enables traditional transactional commit/rollback 
using the [Phoenix Transactions](https://phoenix.apache.org/transactions.html) functionality.
* Compatibility with .NET DataTable and DataGridView 

The Garuda.Data project is part of a solution, GarudaUtil, which includes a graphical user interface for connecting to and querying
Apache Phoenix using the Garuda.Data library. 

![Garuda Query UI](/img/GarudaQueryScreenshot.png)

[The GarudaUtil solution including Garuda.Data and Garuda Query, is available on GitHub.](https://github.com/dwdii/GarudaUtil). I welcome
feedback! Please use the [GarudaUtil Issues](https://github.com/dwdii/GarudaUtil/issues) section to report any bugs or enhancements.

Links:

* https://www.nuget.org/packages/Garuda.Data/
* https://github.com/dwdii/GarudaUtil

Best,

[Daniel (@dwdii)](http://twitter.com/dwdii)
