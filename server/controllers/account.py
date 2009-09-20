from decorator import decorator

import logging
log = logging.getLogger(__name__)

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from pylons.decorators import rest

from server.lib.base import BaseController, render

from google.appengine.ext import db

from server.model import *



"""
Decorator used to dispatch the authentication of users credentials
If the requested account is found, this method identifies the requested
authentication mechanism and passes along the request to a specialized along
with the account name, current password hash and the authentication string
supplied in the HTTP headers.

If authentication succeeds the application flow is uninterupted, but if it
fails an exception containing a standard AtomixAPI error code will bubble up.
"""
@decorator
def authenticate_account(f, *args, **kws):
	# First check the account name requested and fails if it cannot be found
	try:
		if len(list(args))>0: accountname = list(args)[1]
		if not accountname: raise Exception("atomix.provider.authFail.invalidAccountname")
		account = atomixapi.get_account(accountname)
		if not account: raise Exception("atomix.provider.authFail.invalidAccountname")
	except Exception, e:
		response.headers["atomix-error"] = e.args[0]
		abort(400)

	# Retrieve the authentication method from the HTTP headers
	authString = request.headers.get("AUTHENTICATION")

	if not authString: raise Exception("atomix.provider.authFail.unsupportedAuthMethod")

	authMethod, sep, authKey = authString.partition(" ")
	try:
		if authMethod.upper() == "BASIC":
			authenticate_basic(accountname, account.password, authKey)
		elif authMethod.upper() == "WSSE":
			if authKey.upper() != 'PROFILE="USERNAMETOKEN"':
				raise Exception("atomix.provider.authFail.unsupportedAuthMethod")
			wsseAuthString = request.headers.get("X-WSSE")
			if not wsseAuthString:
				raise Exception("atomix.provider.authFail.missingAuthHeaders")
			account = authenticate_wsse_usernametoken(accountname, account.password, wsseAuthString)
		else:
			raise Exception("atomix.provider.authFail.unsupportedAuthMethod")
	except Exception, e:
		response.headers["atomix-error"] = e.args[0]
		abort(400)
	return f(*args, **kws)

def authenticate_basic(accountname, password, authString):
	import base64
	credentials = base64.b64decode(authString)
	reqAccountname, sep, reqPassword = credentials.partition(":")
	if (password != reqPassword):
		raise Exception("atomix.provider.authFail.invalidPassword")
	if (accountname != reqAccountname):
		raise Exception("atomix.provider.authFail.invalidAccountname")

"""
Implementation of WSSE Username Token http://www.xml.com/lpt/a/1337
"""
def authenticate_wsse_usernametoken(accountname, password, authString):
	import base64, hashlib, datetime

	wsseMethod, sep, wsseString = authString.partition(" ")
	#Sample wsse dict: Username="bob", PasswordDigest="quR/EWLAV4xLf9Zqyw4pDmfV9OY=", Nonce="d36e316282959a9ed4c89851497a717f", Created="2003-12-15T14:43:07Z"
	wsse  = parse_quoted_dict(wsseString)
	if (accountname != wsse.get("Username")):
		raise Exception("atomix.provider.authFail.invalidAccountname")
	creationTimestamp = datetime.datetime.strptime(wsse.get("Created"), "%Y-%m-%dT%H:%M:%Sz")
	allowedExpiraton = datetime.timedelta(0, 0, 0, 0, 1) # 1 minute max
	log.debug("Now + creationTimestamp:")
	log.debug(datetime.datetime.now())
	log.debug(creationTimestamp)
	log.debug(datetime.datetime.now() - creationTimestamp > allowedExpiraton)
	if (datetime.datetime.now() - creationTimestamp > allowedExpiraton):
		raise Exception("atomix.provider.authFail.invalidTimestamp")
	if (datetime.datetime.now() < creationTimestamp):
		raise Exception("atomix.provider.authFail.invalidTimestamp")
	passwordDigest = base64.b64encode(
		hashlib.sha1(
			wsse.get("Nonce")+wsse.get("Created")+password
		).hexdigest()
	)
	if (passwordDigest != wsse.get("PasswordDigest")):
		raise Exception("atomix.provider.authFail.invalidPassword")




"""
Method for parsing a quoted values dictionnary and return the value as a
native dict object
"""
def parse_quoted_dict(strDict):
	objDict = {}
	tokensArray = [[pair.partition('="')[0], pair.partition('="')[2][:-1]] for pair in [itm.strip() for itm in strDict.split(",")]]
	for token in tokensArray: objDict[token[0]]=token[1]
	return objDict


class AccountController(BaseController):

	@authenticate_account
	def serviceDocument(self, accountname):
		response.content_type = "application/atom+xml"
		return render('account-serviceDocument.mako')

	@authenticate_account
	def home(self, accountname):
		account = atomixapi.get_account(accountname)
		return render('account-home.mako')

	def notfound(self, accountname):
		log.debug("----------------notfound(self, accountname)")
		return render('account-notfound.mako')

	#@rest.dispatch_on(POST='create_onpost')
	#def create(self, accountname):
	#	account = atomixapi.get_account(accountname)
	#	if account:
	#		redirect_to('alreadyexist', accountname=accountname)
	#	else:
	#		return render('account-create.mako')

	#def create_onpost(self, accountname):
	#	account = atomixapi.get_account(accountname)

