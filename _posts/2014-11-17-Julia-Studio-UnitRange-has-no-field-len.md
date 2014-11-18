---
layout: post
title: Julia Studio ERROR type UnitRange has no field len
tags: Julia,Error,Workaround
---
{{ page.title }}
----------------
FYI - you might get flacky behaviour from Julia Studio. I did. I'm on Windows 8.1 and every time I tried to run a jl script it either would do nothing, 
or I would get the error in the subject of this thread (and maybe the script would run). The Julia Studio Console didn't seem to work either. It looks 
like there is a bug in the ConsoleLogic.jl script that comes with Julia Studio 0.4.5. I seem to have fixed my issue by editing the ConsoleLogic.jl 
script on line 210 to change range.len to be range.length. Apparently the correct property is length (not len).

See the following link under the General Collections header for the documenation: [http://julia.readthedocs.org/en/latest/stdlib/base/](http://julia.readthedocs.org/en/latest/stdlib/base/)

I have not found a blog or stackoverflow article on this yet so I thought I would share my experience.

I had to run Notepad as administrator in order to edit the ConsoleLogic.jl since it resides in the Program Files area. You can do this by clicking 
the Start button &gt; typing Notepad (don't push enter) &gt; right click on the Notepad search result &gt; select Run as administrator. Then browse to the ConsoleLogic.jl file. 
My was under C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\Console\ConsoleLogic.jl but the error message in Julia Studio will tell you where yours is.

<pre>
ERROR: type UnitRange has no field len 
 in on_complete_msg at C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\Console\ConsoleLogic.jl:210
 in handle_input at C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\Console\ConsoleLogic.jl:229
 in anonymous at C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\Console\ConsoleLogic.jl:246
 in handle_pending_events at C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\juliet\src\modules/event/event.jl:84
 in update at C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\juliet\src\modules/event/event.jl:59
 in event_loop at C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\juliet\src\modules/event/event.jl:72
 in run at C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\juliet\src\juliet-engine.jl:48
 in include at boot.jl:245
 in include_from_node1 at loading.jl:128
 in process_options at client.jl:285
 in _start at client.jl:354
while loading C:\Program Files\JuliaStudio-0.4.5\julia-studio\share\julia-studio\Console\Console.jl, in expression starting on line 21
</pre>

Best,

[Daniel (@dwdii)](http://twitter.com/dwdii)
