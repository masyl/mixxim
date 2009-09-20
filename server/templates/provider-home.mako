<%inherit file="base.mako"/>\
<h1>Welcome ${c.provider.name} </h1>

<h3>Get started:</h3>
<ul>
	<li>
		<a href="http://${c.provider.host}/atomixapi">Provider home address</a>
	</li>
	<li>
		<a href="http://${c.provider.host}/clients/mixxim/index.html">Mixxim client</a>
	</li>
</ul>
