<%inherit file="base-xml.mako"/>\
<entry xmlns="http://www.w3.org/2005/Atom" xmlns:atomix="http://atomix-api.com/2009/Atomix">
	<title>${c.item.title}</title>
	<id>${c.item.id()}</id>
	<summary type="text">${c.item.summary}</summary>
	<atomix:content type="${c.item.dataType}" xml:lang="${c.item.dataLang}" xml:base="http://localhost:8080/mix/"><![CDATA[ ${c.item.dataJSON()} ]]></atomix:content>
	<content type="xhtml" xml:lang="en" xml:base="http://localhost:8080/mix/">
		<div xmlns="http://www.w3.org/1999/xhtml">${c.item.content}</div>
	</content>
</entry>
