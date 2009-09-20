import logging
log = logging.getLogger(__name__)

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from pylons.decorators import rest

from server.lib.base import BaseController, render


from google.appengine.ext import db

from server.model import *
import server.model.atomixapi as atomixapi

log = logging.getLogger(__name__)

class Provider(db.Model):
	pass

"""This consoller returns the basic atomix provider information in the http headers for the discovery process to occur"""
class ProviderController(BaseController):

	def home(self):
		
		provider = atomixapi.Provider.all().filter("host =", request.host).get()
		if not provider:
			provider = atomixapi.Provider()
			provider.host = request.host
			provider.name = request.host + " Atomix Provider"
			provider.put()
		c.provider = provider
		return render('provider-home.mako')

	def discovery(self):
		provider = atomixapi.Provider.all().filter("host =", request.host).get()
		if provider:
			response.headers["atomix-homepage"] = "http://" + provider.host
			response.headers["atomix-version"] = "0.1"
			response.headers["atomix-base"] = "http://" + provider.host + "/atomixapi/"
			response.headers["atomix-name"] = provider.name
			return ""
		else:
			abort(404)

	@rest.dispatch_on(POST='accounts_create')
	def accounts(self):
		abort(404)

	def accounts_create(self):
		item = atomixapi.parseItem(request.body)
		log.debug("item.data.name")
		log.debug(item.dataObject["name"])
		accountname = item.dataObject["name"]
		newAccount = atomixapi.get_account(accountname)
		if newAccount:
			response.status = '400 Bad Request'
			response.content_type = 'text/plain'
			return "atomix.provider.createAccount.accountNameNotAvailable"
		else:
			newAccount = atomixapi.Account(name=accountname)
			newAccount.password = item.dataObject["password"]
			newAccount.put()
			c.account = newAccount
			response.content_type = "application/atom+xml"
			return render('provider-account.mako')

	def terms(self):
		import server.model.atomixapi as atomixapi
		key = db.Key.from_path("Item", "mixxim_terms_of_service_sept09_v1")
		item = db.get(key)
		if not item:
			item = atomixapi.Item(key_name="mixxim_terms_of_service_sept09_v1")

		item.title = "Terms of services for mixxim.com Atomix service, Sept 2009, v1"
		item.summary = "This item contains the detailed terms of services for the Atomix API of mixxim.com as of September 2009. Version 1."
		item.dataType = "types.atomix-api.com/api/terms"
		item.dataLang = "en"
		item.dataObject["version"] = "1"
		item.dataObject["locale"] = "en"
		item.dataObject["text"] = """
Mixxim.com terms of service!!!

Lorem ipsum dolor sit amet....

Lorem ipsum dolor sit amet....

Lorem ipsum dolor sit amet....

Lorem ipsum dolor sit amet....
"""
		item.dataObject["html"] = """
<div>
	<h1>Mixxim.com terms of service!!!</h1>
	<p>
		Lorem ipsum dolor sit amet....
	</p>
	<p>
		Lorem ipsum dolor sit amet....
	</p>
	<p>
		Lorem ipsum dolor sit amet....
	</p>
	<p>
		Lorem ipsum dolor sit amet....
	</p>
</div>
"""
		item.content = item.dataObject["html"]
		item.put()
		c.item = item
		response.content_type = "application/atom+xml"
		return render('atomixapi-item.mako')
		#return item.xml()

