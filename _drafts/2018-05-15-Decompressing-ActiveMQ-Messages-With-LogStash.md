---
layout: post
title: Decompressing Gzip ActiveMQ Messages With LogStash
tags: LogStash,ActiveMQ,ElasticSearch,Analytics,Glue,GZIP
keywords: LogStash,ActiveMQ,JBOSS,ElasticSearch,Analytics,Glue,GZIP
---
{{ page.title }}
----------------
As mentioned in <a class="prev" href="{{page.previous.url}}">my prior post</a>, I need to send ActiveMQ messages to ElasticSearch, and 
was curious about LogStash's potential to accomplish this. One aspect of the need to to handle 
[GZIP-encoded](https://en.wikipedia.org/wiki/Gzip) [JSON](https://en.wikipedia.org/wiki/JSON) messages.

Initially, I found the codec concept which seemed like the "LogStash" way of dealing with the GZIP encoding, and identified the 
[logstash-codec-gzip_lines](https://www.elastic.co/guide/en/logstash/5.3/plugins-codecs-gzip_lines.html) and 
[logstash-codec-compress_spooler](https://www.elastic.co/guide/en/logstash/5.3/plugins-codecs-compress_spooler.html).

## gzip_lines

It turns out that the gzip_lines codec expects the encoded content to be a list of lines which are separate messages, such as a 
gzip'd log file where each line is a log entry which should be indexed separately. In my case, the JSON content might span multiple lines
but is a single message, so gzip_lines was not a good fit. Separate from this, the gzip_lines codec expects the data it receives 
to be an IO stream (or equivalent) that can be passed directly to `Zlib::GzipReader.new`, which is not the case from the jms input plugin. As a result, a processing error is thrown which appears
to be mishandled and result in the `Encoding::CompatibilityError` shown below. Since the jms input plugin works fine with plain old JSON, my interpretation is that an
exception is thrown from the gzip_lines codec, but the `@logger.error` processing doesn't handle the `JMS::BytesMessage` type which is coming out of jms 
in this gzip case, and this results in the `Encoding::CompatibilityError`.
.
See the [GitHub logstash-input-jms jms.rb code](https://github.com/logstash-plugins/logstash-input-jms/blob/master/lib/logstash/inputs/jms.rb#L145) for details.

```
2018-05-16 20:04:04,326 [main]<jms ERROR An exception occurred processing Appender plain_console org.jruby.exceptions.RaiseException: (Encoding::CompatibilityError) incompatible encodings: ASCII-8BIT and UTF-8
        at org.jruby.RubyHash.inspect(org/jruby/RubyHash.java:848)
        at org.jruby.RubyHash.to_s(org/jruby/RubyHash.java:910)
        at RUBY.error(C:/Databases/logstash-5.3.3/logstash-core/lib/logstash/logging/logger.rb:56)
        at RUBY.queue_event(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/logstash-input-jms-3.0.5-java/lib/logstash/inputs/jms.rb:177)
        at RUBY.run_consumer(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/logstash-input-jms-3.0.5-java/lib/logstash/inputs/jms.rb:190)
        at org.jruby.RubyProc.call(org/jruby/RubyProc.java:281)
        at RUBY.each(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/jruby-jms-1.2.0-java/lib/jms/message_consumer.rb:55)
        at RUBY.consume(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/jruby-jms-1.2.0-java/lib/jms/session.rb:402)
        at RUBY.run_consumer(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/logstash-input-jms-3.0.5-java/lib/logstash/inputs/jms.rb:189)
        at org.jruby.RubyProc.call(org/jruby/RubyProc.java:281)
        at RUBY.session(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/jruby-jms-1.2.0-java/lib/jms/connection.rb:258)
        at RUBY.session(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/jruby-jms-1.2.0-java/lib/jms/connection.rb:71)
        at org.jruby.RubyProc.call(org/jruby/RubyProc.java:281)
        at RUBY.start(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/jruby-jms-1.2.0-java/lib/jms/connection.rb:53)
        at RUBY.session(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/jruby-jms-1.2.0-java/lib/jms/connection.rb:70)
        at RUBY.run_consumer(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/logstash-input-jms-3.0.5-java/lib/logstash/inputs/jms.rb:186)
        at RUBY.run(C:/Databases/logstash-5.3.3/vendor/bundle/jruby/1.9/gems/logstash-input-jms-3.0.5-java/lib/logstash/inputs/jms.rb:257)
        at RUBY.inputworker(C:/Databases/logstash-5.3.3/logstash-core/lib/logstash/pipeline.rb:425)
        at RUBY.start_input(C:/Databases/logstash-5.3.3/logstash-core/lib/logstash/pipeline.rb:419)
```

## compress_spooler

After my experience with `gzip_lines`, the [`compress_spooler`](https://www.elastic.co/guide/en/logstash/5.4/plugins-codecs-compress_spooler.html) codec seemed like it might be what I needed. 
I haven't found a good reference to explain what it is meant to do,
but based on [the code on github.com/logstash-plugins/logstash-codec-compress_spooler](https://github.com/logstash-plugins/logstash-codec-compress_spooler/blob/master/lib/logstash/codecs/compress_spooler.rb), 
the `decode` function uses `ZLib::Inflate` to decompress input data and then `MessagePack.unpack` to create a result which is iterable over multiple events. I translate this
to mean `compress_spooler` assumes the message data is in [MessagePack format](https://github.com/msgpack/msgpack-ruby) (which, in my case, it is not) and that the `Zlib::Deflate` 
or equivalent was used to compress the data. If one were to use the codec's `encode` function, these assumptions appear to hold. For example, if one instance of LogStash where used
to receive the raw input, feed into the `compress_spooler` codec, then pass (possibily across process or machine boundaries) to another LogStash which used the codec as a decoder during output to ElasticSearch),
then the codec would work well.

Anyway, this is not my case... but having inspected the code in detail, I decided to try tweaking it to work for what I needed. I ended up with the following `decode` function. 
Note the `StringIO.new` inside the `Zlib::GzipReader.new` call. This is what was "lacking" in the `gzip_lines` codec which turned the raw byte data into an IO stream for use by the `GzipReader`.

{%highlight ruby%}
  def decode(data)
	@logger.warn("codec: ", data)

    @decoder = Zlib::GzipReader.new(StringIO.new(data))

	raw = @decoder.read

	yield LogStash::Event.new("message" => raw)
  end # def decode
{% endhighlight %}

I could continue to use this hacked `compress_spooler`, but that just wouldn't be right. My next step was to figure how to make my own codec that did this simple generic Gzip decompression.

I bumped into [this LogStash issue on GitHub](https://github.com/elastic/logstash/issues/1817) which reinforced that there was not an existing solution which I simply hadn't found yet.

I proceeded to investigate how to create my own codec... reading [How to write a LogStash codec plugin](https://www.elastic.co/guide/en/logstash/current/_how_to_write_a_logstash_codec_plugin.html). 
I'm no Ruby developer, but I've since started learning the basics. Installing Ruby, realizing LogStash plugins seem to require JRuby, `bundler`, etc. Just as I was digging in to figure this all
out, I searched RubyGems.org and found...


## logstash-codec-json_gz

https://rubygems.org/gems/logstash-codec-json_gz

https://github.com/dterziev/logstash-codec-json_gz



Best,

[Daniel (@dwdii)](http://twitter.com/dwdii)
