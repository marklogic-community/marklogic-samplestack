sample-database
============

MarkLogic server-side configuration and extensions for MarkLogic three-tier architecure

This project is intended for use as a submodule of sample-java-stack and
sample-node-stack, in order to provide a structure to hold MarkLogic
server-side application and datbase configuration.

Here are things you'll want to manipulate for your application:
manage-properties.json
rest-properties.json
ext         server modules to be stored in the application's modules database.
options     options configurations for the application searches
rest-ext    resource extensions for the REST server
transforms  XSLT, XQuery transforms
reducers    JavaScript server-side modules
seed-data   sample data to be loaded into the database
