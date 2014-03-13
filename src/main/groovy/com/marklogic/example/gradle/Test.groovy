package com.marklogic.example.gradle

import groovy.json.*

public class Test {
  static main( args ) {
    def slurper = new JsonSlurper()
    def config = slurper.parseText( Test.class.getResource( '/config.json' ).text )
    println "Args were $args, config is $config"
  }
}
