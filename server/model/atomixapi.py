import logging
log = logging.getLogger(__name__)

from google.appengine.ext import db

idBase = "urn:atomix://johndoe@mixxim.com/"


class Account(db.Model):
	name = db.StringProperty(required=True)
	password = db.StringProperty(required=False)
	status = db.StringProperty(required=False)
	confirmationCode = db.StringProperty(required=False)

	def id(self):
		return "urn:atomix://" + self.address()

	def address(self):
		return "urn:atomix://" + self.name + "@mixxim.com"

def get_account(accountname):
	log.debug("----------------get_account(accountname)")
	account = db.Query(Account).filter("name = ", accountname).get()
	if account:
		return account
	return None

class Provider(db.Model):

	name = db.StringProperty(required=False)
	host = db.StringProperty(required=False)

class Item(db.Model):

	account = db.ReferenceProperty(Account)
	title = db.StringProperty(required=False)
	summary = db.TextProperty(required=False)
	author = db.StringProperty(required=False)
	content = db.TextProperty(required=False)
	dataObject = {}
	data = db.TextProperty(required=False)
	dataLang = db.StringProperty(required=False)
	dataType = db.StringProperty(required=False)
	sourceURL = db.StringProperty(required=False)
	sourceXML = db.TextProperty(required=False)

	def id(self):
		return idBase + str(self.key())
	
	def dataJSON(self):
		import simplejson
		jsonStr = simplejson.dumps(self.dataObject)
		return jsonStr



def parseItem(xml):
	#from xml.dom.minidom import parse, parseString
	import xml.dom.minidom as minidom
	import simplejson
	
	itemDom = minidom.parseString(xml)
	newItem = Item()

	
	if len(itemDom.getElementsByTagName("title")) > 0:
		newItem.title = itemDom.getElementsByTagName("title")[0].nodeValue
	if len(itemDom.getElementsByTagName("summary")) > 0:
		newItem.summary = itemDom.getElementsByTagName("summary")[0].nodeValue
	if len(itemDom.getElementsByTagName("author")) > 0:
		newItem.author = itemDom.getElementsByTagName("author")[0].nodeValue
	if len(itemDom.getElementsByTagName("content")) > 0:
		newItem.content = itemDom.getElementsByTagName("content")[0].nodeValue

	if len(itemDom.getElementsByTagName("atomix:data")) > 0:
		dataNode = itemDom.getElementsByTagName("atomix:data")[0]
		dataStr = dataNode.firstChild.data
		data = simplejson.loads(dataStr)
		newItem.sourceXML = xml
		newItem.dataObject = data
		newItem.data = dataStr
		newItem.dataLang = dataNode.attributes["xml:lang"].value
		newItem.dataType = dataNode.attributes["type"].value
	
	return newItem
