<%inherit file="base.mako"/>\

<h1>Account not found</h1>
<p>
	We cannot find an account name "${c.accountname}". Please check for typos.
</p>

<h2>Other options:</h2>
<ul>
	<li><a href="${url('create', accountname=c.accountname)}">Create a new account named ${c.accountname}</a></li>
</ul>