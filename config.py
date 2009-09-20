APP_NAME = 'server.config.middleware:make_app'
APP_ARGS = ({},)
APP_KWARGS = dict()
APP_KWARGS["debug"] = True

APP_KWARGS.update({'beaker.session.type': 'google', 'beaker.session.table_name': 'beaker_session',
                   'beaker.session.key': 'pylonstestapp', 'beaker.session.secret': 'secret',
                   'beaker.cache.type': 'google', 'beaker.cache.table_name': 'beaker_cache'})

# You can overwrite these separately for different dev/live settings:
DEV_APP_ARGS = APP_ARGS
DEV_APP_KWARGS = APP_KWARGS
REMOVE_SYSTEM_LIBRARIES = ['webob']

