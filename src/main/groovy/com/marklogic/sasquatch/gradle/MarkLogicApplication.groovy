package com.marklogic.sasquatch.gradle

import groovy.json.*
import groovyx.net.http.RESTClient

public class MarkLogicApplication {


    static void putPackage(host, name, username, password) {
        RESTClient client = new RESTClient("http://" + host + ":8002/manage/v2/packages")
        client.auth.basic username, password
        def params = [:]
        params.query = ["pkgname": name ]
        params.contentType = "application/json"
        params.body = MarkLogicApplication.class.getResource('/app-package.json').openStream().text
        println(params.body)
        try {
            client.post(params)
        }
        catch (ex) {
            println ex.response.data
        }
    }

    static void installPackage(host, name, username, password) {
        RESTClient client = new RESTClient("http://" + host + ":8002/manage/v2/packages/"+ name + "/install")
        client.auth.basic username, password
        def params = [:]
        params.contentType = "application/json"
        params.body = "{}"
        try {
            client.post(params)
        }
        catch (ex) {
            println ex.response.status
            println ex.response.statusLine
        }
    }


    static main( args ) {
        def props = new java.util.Properties()
        props.load( MarkLogicApplication.class.getResource('/sasquatch.properties').openStream() )
        def config = new ConfigSlurper().parse(props)

        println "Saving Package"
        putPackage( config.host, config.applicationName, config.applicationUser, config.applicationPassword )

        println "Installing Package"
        installPackage( config.host, config.applicationName, config.applicationUser, config.applicationPassword )

        println "Done"

    }
}
