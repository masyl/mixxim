<%inherit file="base.mako"/>\

<h1>Oups, account already exists!</h1>

<p>
	There already exists an account called ${c.accountname}
</p>
<p>
	<a href="/mix/${c.accountname}/">Visit ${c.accountname}</a>
</p>
