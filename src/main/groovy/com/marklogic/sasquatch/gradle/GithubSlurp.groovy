package com.marklogic.sasquatch.gradle

import groovy.json.*
import groovyx.net.http.RESTClient

public class GithubSlurp {

    static void postJson(client, config, jsonObject) {
        client.auth.basic config.username, config.password
        def params = [:]
        params.path = "/v1/documents"
        params.queryString = "directory=/github/&extension=json"
        params.contentType = "application/json"
		params.body = jsonObject
        println (client.post(params))
    }

    static main( args ) {
        def props = new java.util.Properties()
        props.load( GithubSlurp.class.getResource('/sasquatch.properties').openStream() )
        def config = new ConfigSlurper().parse(props)
        println config
        RESTClient client = new RESTClient("http://" + config.host + ":" + config.port)
        def slurper = new JsonSlurper()
        def input = new File( args[0] ).text.replaceAll(~"\\}\\{", "}XXXXXXXX{")
        def jsonObjects = input.splitEachLine(~"XXXXXXXX", { it.each { slurper.parseText( it ) }})
        jsonObjects.each{ 
            postJson(client, config, it)
            println "Posted a JSON object" 
        }
    }
}
