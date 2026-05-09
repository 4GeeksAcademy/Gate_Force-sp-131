release: flask db upgrade
web: gunicorn --worker-class eventlet --workers 1 --chdir ./src/ wsgi:application
