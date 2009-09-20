<%inherit file="base-xml.mako"/>\
<entry xmlns="http://www.w3.org/2005/Atom" xmlns:atomix="http://atomix-api.com/2009/Atomix">
	<title>${c.account.name}</title>
	<id>${c.account.name}@mixxim.com</id>
	<summary type="text">
		An atomix accout named ${c.account.name}@mixxim.com
	</summary>
<atomix:data atomix:type="http:\\types.atomix-api.com\api\account" xml:lang="en" xml:base="http://localhost:8080/mix/"><![CDATA[
{
"id": "${c.account.id()}",
"name": "${c.account.name}",
"address": "${c.account.address()}",
"status": "ok",
"confirmationCode": "some-random-number",
"terms": "http:\/\/localhost:8080\/mix\/_provider\/terms"
}	
]]></atomix:data>
	<content type="xhtml" xml:lang="en" xml:base="http://localhost:8080/mix/">
		<div xmlns="http://www.w3.org/1999/xhtml">
			<p>${c.account.name}@mixxim.com is an atomix account at mixxim.com</p>
		</div>
	</content>
</entry>
