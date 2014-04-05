import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class RESTConfigureTask extends DefaultTask {

    def transforms = "src/main/server/transforms"
    def extensions = "src/main/server/ext"

    @TaskAction
    void configureREST() {
        def transformsDirectory = new File(transforms)
        transformsDirectory.listFiles().each { putTransform(it) }

        def extensionsDirectory = new File(extensions)
        extensionsDirectory.listFiles().each { putExtension(it) }

        println "configuring JSON errors"
        configureJSONErrors()
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
            try {
                client.put(params)
            }
            catch (ex) {
                println ex.response.status
                println ex.response.data.text
            }
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
        try {
            client.put(params)
        }
        catch (ex) {
            println ex
            println ex
        }
    }

    void configureJSONErrors() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":" + project.markLogicPort + "/v1/config/properties")
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.contentType = "application/json"
        params.body = "{\"error-format\":\"json\"}"
        try {
            client.put(params)
        }
        catch (groovy.json.JsonException ex) {
            println ex.response.status
            println ex.response.statusLine
        }
    }
}
