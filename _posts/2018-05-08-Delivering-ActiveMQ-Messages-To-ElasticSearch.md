---
layout: post
title: Delivering ActiveMQ Messages to ElasticSearch with LogStash
tags: LogStash,ActiveMQ,ElasticSearch,Analytics,Glue
keywords: LogStash,ActiveMQ,ElasticSearch,Analytics,Glue
---
{{ page.title }}
----------------
I was faced with a need to share messages sent through [Apache ActiveMQ](http://activemq.apache.org/) 
(actually [RedHat JBoss AMQ](https://www.redhat.com/en/technologies/jboss-middleware/amq)) 
to [ElasticSearch](https://www.elastic.co/products/elasticsearch). While evaluating options, 
using [LogStash](https://www.elastic.co/products/logstash) seemed like an obvious approach which 
needed a closer look. It wasn't immediately apparent how one might connect ActiveMQ to ElasticSearch 
with LogStash. There are several input plugins for LogStash which look promising, but what are their
differences? Pros/cons? This blog post chronicles some of the research so you or my future self can 
refer to it when needing to integrate these technologies. 

To get the proof of concepts up and running quickly, I used Amazon MQ (which is based on Apache ActiveMQ) and my
currently installed ELK stack. Specific versions are listed below:


| Component     | Version |
|---------------|---------|
| Amazon MQ     | v5.15.0 |
| ElasticSearch | v5.3.3  |
| LogStash      | v5.3.3  |
{:.table .table-condensed .table-bordered}

First I paged through the LogStash documentation to see which input plugins where good candidates:

* [Jms input plugin](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-jms.html)
* [Jmx input plugin](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-jmx.html)
* [Rabbitmq input plugin](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-rabbitmq.html)

The first, Jms input plugin, seemed to be the most likely to meet the need, so I started there. The `logstash-input-jms` plugin,
as it is refered to when installing, provides two configuration methods... either in the LogStash.config file or a separate YAML file.
I made the initial mistake of mixing these and trying to do some config in the LogStash.config and some in a referenced YAML. As it turns out, 
the YAML file (if specified) takes precedence.

After figuring that out, my LogStash.config looked something like this:

{% highlight json %}
input {

  jms {
	  id => "my_first_jms"
	  use_jms_timestamp => true
	  destination => "AmqToLogstash"
	  broker_url => "ssl://uniqueid.mq.us-east-1.amazonaws.com:61617"
	  username => "logstash23"
	  password => "password123"
	  factory => "org.apache.activemq.ActiveMQSslConnectionFactory"
	  require_jars => ["C:\Users\Dan\Downloads\apache-activemq-5.15.3\activemq-all-5.15.3.jar"]
	}
}

filter {
	json{
	  source => "message"
	}
	
	mutate {
      add_field => { "fullIndex" => "amqndx-%{+YYYY.MM.dd}" }
	}

}

output {
	stdout { }

	elasticsearch {
	  hosts => ['http://localhost:9200']
	  index => "%{fullIndex}"
  }
}
{% endhighlight %}

I had downloaded the Apache ActiveMQ 5.15.3 release from apache.org to get the JAR file referenced in the `require_jars` field. 
This was required for the `factory` class I had selected based on an educated guess from the Amazon MQ URL.

Embedding the AMQ connection config in the LogStash.config was quick and easy, but the YAML approach seemed like it would scale better. 
I updated my LogStash.config to point to my `jms-aws-amq-dwdii.yml` file and moved the AMQ connection details over to the it. I then 
got the following error message:

```
[2018-05-12T16:08:02,900][ERROR][logstash.inputs.jms      ] Missing a required setting for the jms input plugin:

  input {
    jms {
      destination => # SETTING MISSING
      ...
    }
  }
```

I had moved all `logstash-input-jms` plugin setttings to the YAML file including the `destination`. As it turns out, the YAML is only meant 
to house the broker connection details. Refer to the [JRuby JMS Connection](https://www.rubydoc.info/gems/jruby-jms/0.10.1/JMS%2FConnection:initialize) 
for more information on specific connection properties for various message brokers.

After moving `destination` back into my LogStash.config (along with the `use_jms_timestamp`), LogStash started up error-free and was receiving messages
from my AMQ instance.

My `jms-aws-amq-dwdii.yml` file:

```
dev:
  :factory: org.apache.activemq.ActiveMQSslConnectionFactory
  :broker_url: "ssl://unique.mq.us-east-1.amazonaws.com:61617"
  :require_jars:
    - C:\Users\Dan\Downloads\apache-activemq-5.15.3\activemq-all-5.15.3.jar
  :username: "logstash23"
  :password: "password123"
```

The updated `jms` section of `LogStash.config`:

{% highlight json %}
input {

  jms {
        id => "my_first_jms"
		yaml_file => "C:\logstash-5.3.3\config\jms-aws-amq-dwdii.yml"
		yaml_section => "dev"
		destination => "AmqToLogstash"
		use_jms_timestamp => true
	}
}
{% endhighlight %}

This seemed to work very well and I was happily loading messages into ElasticSearch. Unfortunately, it did not meet all my criteria. 
I have some cases in which the message is GZip'd, and others where the content of the message is actually 
a `DataStructure` (ActiveMQ Advisory messages). I decided to tackle the GZip aspect next... look for that in a follow-up post!

Best,

[Daniel (@dwdii)](http://twitter.com/dwdii)
