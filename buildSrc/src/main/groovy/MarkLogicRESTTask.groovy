import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicRESTTask extends MarkLogicTask {

    def database = "db-config"
    def transforms = database + "/transforms"
    def extensions = database + "/ext"
    def restExtensions = database + "/services"
    def restOptions = database + "/options"
    def properties = database + "/rest-properties.json"

    @TaskAction
    void configureREST() {
        def transformsDirectory = new File(transforms)
        transformsDirectory.listFiles().each { putTransform(it) }

        def extensionsDirectory = new File(extensions)
        extensionsDirectory.listFiles().each { putExtension(it) }

        def restExtensionsDirectory = new File(restExtensions)
        restExtensionsDirectory.listFiles().each { putRESTExtension(it) }

        def restOptionsDirectory = new File(restOptions)
        restOptionsDirectory.listFiles().each { putRESTOptions(it) }
        configureProperties()
        println "Done"
    }

    void putTransform(transform) {
        def transformFileName = transform.getPath().replaceAll(~"\\\\","/")
        def transformName = transformFileName.replaceAll(~"\\.[^\\.]+", "").replaceAll(~".*\\/","")

        if (transformName) {
            println "Saving transform " + transformName
            RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/transforms/" + transformName)
            client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
            client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
            def params = [:]
            params.contentType = "application/xquery"
            params.body = transform.text
            put(client, params)
        }
        else {
            println "Skipping filename " + transformName
        }
    }

    void putExtension(extension) {
        def extensionFileName = extension.getPath().replaceAll(~"\\\\","/")
        def extensionName = 
            extensionFileName.replaceAll(~".*\\/","")
        println "Saving extension " + extensionFileName
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/ext/" + extensionName)
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/xquery"
        params.body = extension.text
        put(client,params)
    }

    void putRESTExtension(extension) {
        def extensionFileName = extension.getPath().replaceAll(~"\\\\","/")
        def extensionName = 
            extensionFileName.replaceAll(~".*\\/","")
        println "Saving extension " + extensionFileName
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/resources/" + extensionName)
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/xquery"
        params.body = extension.text
        put(client,params)
    }

    void putRESTOptions(options) {
        def optionsFileName = options.getPath().replaceAll(~"\\\\","/").replaceAll(~"\\.json","")
        def optionsName = 
            optionsFileName.replaceAll(~".*\\/","")
        println "Saving options " + optionsFileName
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/query/" + optionsName)
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = options.text
        put(client,params)
    }

    void configureProperties() {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/properties")
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = new File(properties).text
        println "Configuring Properties"
        put(client,params)
    }
}
