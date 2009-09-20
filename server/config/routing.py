"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper

def make_map():
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])
    map.minimization = False

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    # CUSTOM ROUTES HERE

    map.connect('/', controller='provider', action='home')
    map.connect('providerDiscovery', '/atomixapi', controller='provider', action='discovery')
    map.connect('providerCreateAccount', '/atomixapi/_provider/accounts', controller='provider', action='accounts')
    map.connect('providerTerms', '/atomixapi/_provider/terms', controller='provider', action='terms')
    map.connect('accounthome', '/atomixapi/{accountname}/', controller='account', action='home')
    map.connect('create', '/atomixapi/{accountname}/servicedocument', controller='account', action='serviceDocument')
    map.connect('create', '/atomixapi/{accountname}/create', controller='account', action='create')
    map.connect('notfound', '/atomixapi/{accountname}/notfound', controller='account', action='notfound')
    map.connect('alreadyexist', '/atomixapi/{accountname}/alreadyexist', controller='account', action='alreadyexist')

    map.connect('/{controller}/{action}')
    map.connect('/{controller}/{action}/{id}')


    return map
