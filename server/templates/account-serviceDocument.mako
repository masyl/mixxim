<?xml version="1.0" encoding='utf-8'?>
<service xmlns="http://www.w3.org/2007/app" xmlns:atom="http://www.w3.org/2005/Atom">
	<workspace>
		<atom:title>Atomixapi</atom:title>
		<collection href="http://localhost:8080/mix/${c.accountname}" >
			<atom:title>Atomix Items</atom:title>
			<atom:category scheme="http://localhost:8080/mix/${c.accountname}/types/" term="apps" />
		</collection>
	</workspace>
</service>
