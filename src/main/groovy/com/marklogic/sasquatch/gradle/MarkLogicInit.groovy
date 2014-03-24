package com.marklogic.sasquatch.gradle

import groovy.json.*
import groovyx.net.http.RESTClient

public class MarkLogicInit {


    static void initMarkLogic(host) {
        RESTClient client = new RESTClient("http://" + host + ":8001/admin/v1/init")
        def params = [:]
        params.contentType = "application/json"
        params.body = "{}"
        try {
            client.post(params)
        }
        catch (ex) { 
            if ( ex.response.status == 401 )
                println "Server already secured.  Initialization skipped."
            else if ( ex.response.status == 500 )
                println "Server already initialized.  Initialization skipped"
            else 
               throw ex;
        }
    }

    static void setupAdmin(host, adminUsername, adminPassword) {
        RESTClient client = new RESTClient("http://" + host + ":8001/admin/v1/instance-admin")
        def params = [:]
        params.contentType = "application/json"
        params.body = String.format('{ "admin-username" : "%s", "admin-password" : "%s", "realm" : "public" }',adminUsername, adminPassword)
        try {
            client.post(params)
            println "MarkLogic admin secured.  Waiting for server restart."
            Thread.sleep(5000)
        }
        catch (ex) { 
            if ( ex.response.status == 401 )
                println "Server already secured.  Initialization skipped"
            else 
                println "Got" + ex.response.status
        }
    }


    //Milestone 1 only
    static void bootREST(host, port, adminUserName, adminPassword) {
        RESTClient client = new RESTClient("http://" + host + ":8002/v1/rest-apis")
        client.auth.basic adminUserName, adminPassword
        def params = [:]
        params.contentType = "application/json"
        params.body = String.format('{"rest-api" : { "name" : "%s", "port" : %s }}',host, port)
        client.post(params)
    }

    static main( args ) {
        def adminUsername = args[0]
        def adminPassword = args[1]
        def props = new java.util.Properties()
        props.load( GithubSlurp.class.getResource('/sasquatch.properties').openStream() )
        def config = new ConfigSlurper().parse(props)
        initMarkLogic(config.host)

        println "MarkLogic initialized.  Waiting for server restart."
        Thread.sleep(5000)
        
        println "Securing MarkLogic using " + adminUsername + ":" + adminPassword
        setupAdmin(config.host, adminUsername, adminPassword)

        println "MarkLogic ready."


        println "Booting REST API"
        bootREST(config.host, config.port, config.adminUsername, config.adminPassword)

        println "Done"

    }
}
