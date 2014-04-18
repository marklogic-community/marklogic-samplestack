import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicRESTTask extends MarkLogicTask {

    def database = "database"
    def transforms = database + "/transforms"
    def extensions = database + "/ext"
    def restExtensions = database + "/rest-ext"
    def reducers = database + "/reducers"
    def options = database + "/options"
    def properties = database + "/rest-properties.json"

    @TaskAction
    void configureREST() {
        def transformsDirectory = new File(transforms)
        transformsDirectory.listFiles().each { putTransform(it) }

        def extensionsDirectory = new File(extensions)
        extensionsDirectory.listFiles().each { putExtension(it) }

        configureProperties()
        println "Done"
    }

    void putTransform(transform) {
        def transformFileName = transform.getPath()
        def transformName = transformFileName.replaceAll(~"\\.[^\\.]+", "").replaceAll(~".*\\/","")

        if (transformName) {
            println "Saving transform " + transformName
            RESTClient client = new RESTClient("http://" + project.markLogicHost + ":" + project.markLogicPort + "/v1/config/transforms/" + transformName)
            client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
            // client.getDecoder().putAt("application/xquery", client.getDecoder().getAt("text/plain"))


            client.auth.basic project.adminUsername, project.adminPassword
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
        def extensionFileName = extension.getPath()
        def extensionName = 
            extensionFileName.replaceAll(~".*\\/","")
        println "Saving extension " + extensionFileName
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":" + project.markLogicPort + "/v1/ext/" + extensionName)
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.contentType = "application/xquery"
        params.body = extension.text
        put(client,params)
    }

    void configureProperties() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":" + project.markLogicPort + "/v1/config/properties")
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.contentType = "application/json"
        params.body = new File(properties).text
        println "Configuring Properties"
        put(client,params)
    }
}
