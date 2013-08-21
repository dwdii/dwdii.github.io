---
layout: default
title: SammyJS and Mustache in ASP.NET - Short and Sweet 
---
I recently started working with SammyJS in my investment tracking web app and thought others might get some value out of a blog post on the topic. I had already developed a basic app API and ASP.NET website, but wanted to add support for the Single Page App (SPA) model to facilitate mobile access. 

At its core, SammyJS is a JavaScript framework which provides an event and routing subsystem for web apps using jQuery, AJAX, and desiring a structured client-side design. This fit my need and has integrated well so far. 

Obviously, the first thing I needed to do was download the sammy.js JavaScript and save it to my project's js folder. Alternatively, I could reference the file from a CDN. Although neither the Microsoft ASP.NET CDN nor Google CDN host Sammy yet, CloudFare has a large library of JavaScript, etc hosted by their CDNJS project - including Sammy! 

//cdnjs.cloudflare.com/ajax/libs/sammy.js/0.7.4/sammy.min.js

Sammy is compatible with and uses jQuery, so if you haven't already, you'll need to include a reference to jQuery (v1.4.1 or above) also (be sure to add the reference to jQuery above Sammy). 

{{ highlight html linenos}}
<script src="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.9.1.min.js"> </script> 
<script src="./Scripts/sammy-latest.min.js"> </script> 
{{ endhighlight }}

And that's it! Well, almost.

I include my references to Mustache and the SammyJS plugin for Mustache also. All Sammy Plugins can be found in the Sammy repositiory on Github.

Much like RequireJS, Sammy needs a "main" or app specific JavaScript segment best implemented in a separate js file. I called mine sammy-app.js for simplicity.

{{ highlight html linenos}}
<script src="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.9.1.min.js"> </script> 
<script src="./Scripts/sammy-latest.min.js"> </script> 
<script src="./Scripts/mustache.js"> </script> 
<script src="./Scripts/sammy.mustache.js"> </script> 
<script src="./Scripts/sammy-app.js"> </script> 
{{ endhighlight }}

Inside the sammy-app.js goes our single page routing logic. I prefer to use the module pattern for my variables (thanks to Eric Miraglia (@miraglia), for this!), so first you see the "MyGlobalVar" definition. This is not required by Sammy, but I think it is useful so I have retained it here. Also, within the Sammy instantiation, you'll find my reference to Mustache which tells Sammy to fetch and use the Mustache engine for templates. 

{{ highlight js linenos}}
// First, my global variable - not required nor used by Sammy 
var MyGlobalVar = (function () { 

	var my = {}; 

	// Publics 
	my.SammyApp = null; 
	// ... Other missing properties and functions 

	// Return 
	return my; 

} ()); 

// Now, the SammyJS-specific code wrapped inside a DOM-ready global function. 
 (function ($) { 

	MyGlobalVar.SammyApp = $.sammy('#sammyMain', function () { 

	// Reference Mustache for templating functionality 
	this.use('Mustache'); 

	////////////////////////////////////////////////////////////// 
	// Root - Main 'homepage' of SPA 
	this.get('#/', function (context) { 

		context.log('Sam-Main'); 

		// Load the User's Financial Asset table template 
		MyGlobalApp.SammyApp.swap(''); 
		this.render('/Sam/Tmpl/UserFinAssetTable.mustache', { item: 'dummy' }).appendTo(context.$element()); 

		// Load the data rows and populate the table 
		this.load(MyGlobalApp.Ajax_GetUserFinAssets, { json: true, cache: false }).then(function (items) { 

			 $.each(items, function (i, item) { 

				context.log("Ticker: " + item.FinancialAsset.TickerSymbol + "; Shares: " + item.Shares + "; Balance: " + item.Balance); 

				item.Shares = MyGlobalApp.FormatNumber(item.Shares);
				item.Balance = MyGlobalApp.FormatCurrency("$ {n}", item.Balance); 

				context.render('/Sam/Tmpl/UserFinAssetRow.mustache', item).appendTo('#userFinancialAssets');

			}); 
		}); 
	}); 
}); 
{{ endhighlight }}

How does Sammy know where to insert changes into the DOM? When instantiating the Sammy instance, I've specified "#sammyMain" as a parameter. This parameter tells Sammy what node in the DOM is the outer node of it's primary update region. 

{{ highlight js linenos}}
MyGlobalVar.SammyApp = $.sammy('#sammyMain', function () { 
{{ endhighlight }}

In this case my ASP.NET ASPX page is very small. It includes the SCRIPT tags previously mentioned, along with a DIV tag with the "#sammyMain" id, all wrapped in the ASP.NET Content node.

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server"> 
<div id="#sammyMain"> 
</div> 
<script src="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.9.1.min.js"> </script> 
<script src="./Scripts/sammy-latest.min.js"> </script> 
<script src="./Scripts/mustache.js"> </script> 
<script src="./Scripts/sammy.mustache.js"> </script> 
<script src="./Scripts/sammy-app.js"> </script> 
</asp:Content> 
Moving along, I tell Sammy about my "root" route in the call to the get method and specify the handler for the associated event. This get method/handler pattern can be repeated for any number of additional routes you might need.

// Root - Main 'homepage' of SPA 
this.get('#/', function (context) { 


First, I log to help with debugging, then call Sammy's swap method. This isn't important at first, but when you have more than one route, and your user returns to the "root" route, the swap call ensures the content is cleared before new content is rendered. The next line of code brings in the Mustache template for my main grid. For the most part, this Mustache template is just a placeholder for the results of the row template that comes a couple of lines later. 

// Load the User's Financial Asset table template 
MyGlobalApp.SammyApp.swap(''); 
this.render('/Sam/Tmpl/UserFinAssetTable.mustache', { item: 'dummy' }).appendTo(context.$element()); 
// Load the data rows and populate the table 
this.load(MyGlobalApp.Ajax_GetUserFinAssets, { json: true, cache: false }).then(function (items) { 


 $.each(items, function (i, item) { 


context.log("Ticker: " + item.FinancialAsset.TickerSymbol + "; Shares: " + item.Shares + "; Balance: " + item.Balance); 

item.Shares = MyGlobalApp.FormatNumber(item.Shares);
item.Balance = MyGlobalApp.FormatCurrency("$ {n}", item.Balance); 

context.render('/Sam/Tmpl/UserFinAssetRow.mustache', item).appendTo('#userFinancialAssets');

}); Here are the Mustache templates, so you can see how it fits together. First the UserFinAssetTable.mustache template: 
<table id="userFinancialAssets">

<tr>

<th>Ticker</th> 
<th>Shares</th> 
<th>Balance</th> 

</tr> 
</table> 
Next, the UserFinAssetRow.mustache template:

<tr>

<td>

<a href="../FinAsset/?ts={{FinancialAsset.TickerSymbol}}">{{FinancialAsset.TickerSymbol}}<a> 

</td> 
<td>{{Shares}}</td>
<td>{{Balance}}</td> 
</tr>

Admittedly, I don't go into depth on Sammy here, but I hope the examples and explanation I have provided will help others who are starting out with SammyJS and Mustache.

Thanks for reading!

Daniel (@dwdii)
