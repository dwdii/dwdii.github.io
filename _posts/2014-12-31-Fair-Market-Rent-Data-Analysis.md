---
layout: post
title: Fair Market Rent Data Analyzer
tags: Data,Analysis,Python
---
{{ page.title }}
----------------
<a href="https://github.com/dwdii/HudFmrDataAnalyzer"><img style="position: absolute; top: 25; right: 0; border: 0;" src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"></a>
As part of my work in the CUNY Master of Science, Data Analytics program, I developed a small application to load and analyze 
[Fair Market Rent (FMR) data from the U.S. Department of Housing and Urban Development (HUD)](http://www.huduser.org/portal/datasets/fmr.html). 
The application, simply named HudFmrDataAnalyzer, is written in Python, and is just chipping at the iceberg of how rents compare
between localities in the United States, and also how they are changing in recent years. A light weight 1 year future forecast 
using linear regression is included as well.

I decided to [share the project and source code via the MIT License on GitHub](https://github.com/dwdii/HudFmrDataAnalyzer) with the concept
that others might find it useful whether through code examples, using the app as is, or enhancing it for further analysis of the FMR data.

The following map shows rents across the United States for 2015 per the HUD FMR data. You can see Key West hanging 
out at the tip of Florida (orange dot), and the San Fransisco area mid-way up California (also with orangeish dots).

![United States Fair Market Rent 2015](https://raw.githubusercontent.com/dwdii/HudFmrDataAnalyzer/master/Docs/img/Heatmap-US-fmr-3bd-2015.png)

The following chart shows how rents have changed over time for Union County, NJ for a 4 bedroom residence.

![Fair Market Rent - Union County, NJ, 2005 - 2016](https://raw.githubusercontent.com/dwdii/HudFmrDataAnalyzer/master/Docs/img/LinReg-UnionNJ-4bd.png)

### 2016 and Beyond
As it turns out, HUD has modified their data format for the FMR data almost every year since 2005. As a result, HudFmrDataAnalyzer has some hardcoded
mappings between columns and the data expected for the analysis functions. Depending on how the data format looks for 2016 and beyond, a new mapping
dictionary might need to be created, or alternatively an existing mapping dictionary can be specified. To illustrate, the code below shows mapping dictionaries
for years 2005 and 2006. 

{% highlight python linenos %}
def prepColumnMappings(self): 

         # 2005 
         mapping2005 = dict() 
         mapping2005["county"] = 8 
         mapping2005["state"] = 6 
         mapping2005["fmr0"] = 1 
         mapping2005["fmr1"] = 2 
         mapping2005["fmr2"] = 3 
         mapping2005["fmr3"] = 4 
         mapping2005["fmr4"] = 5 
         mapping2005["areaName"] = 10 
         mapping2005["countyName"] = 9 
         mapping2005["stateAlpha"] = 13 
         self.columnMapping[2005] = mapping2005 
 

         # 2006 
         mapping2006 = dict() 
         mapping2006["county"] = 7 
         mapping2006["state"] = 6 
         mapping2006["fmr0"] = 2 
         mapping2006["fmr1"] = 3 
         mapping2006["fmr2"] = 1 
         mapping2006["fmr3"] = 4 
         mapping2006["fmr4"] = 5 
         mapping2006["areaName"] = 11 
         mapping2006["countyName"] = 13 
         mapping2006["stateAlpha"] = 14 
         self.columnMapping[2006] = mapping2006 
{% endhighlight %}

Links:

* [On GitHub: HudFmrDataAnalyzer](https://github.com/dwdii/HudFmrDataAnalyzer)

Best,

[Daniel (@dwdii)](http://twitter.com/dwdii)
