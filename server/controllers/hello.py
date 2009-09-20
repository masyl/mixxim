import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from server.lib.base import BaseController, render

def private(self):
    response.status = "401 Not authenticated"
    return "You are not authenticated"
