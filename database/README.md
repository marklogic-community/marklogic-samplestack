sample-database
============

MarkLogic server-side configuration and extensions for MarkLogic three-tier architecure

Here are things you'll want to manipulate for your application:

* database-properties.json
* rest-properties.json
* ext         server modules to be stored in the application's modules database.
* options     options configurations for the application searches
* services    resource extensions for the REST server
* transforms  XSLT, XQuery transforms
* security    MarkLogic roles, privileges, and users for running the application.

MarkLogic Admin : http://localhost:8001

MarkLogic Query Console : http://localhost:8000/qconsole

If you are interested, the project to create the seed data for samplestack
can be found for the time being at http://github.com/grechaw/samplestack-etl
