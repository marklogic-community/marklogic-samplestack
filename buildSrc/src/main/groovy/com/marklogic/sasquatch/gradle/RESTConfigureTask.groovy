import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class RESTConfigureTask extends DefaultTask {

    @TaskAction
    void configureREST() {
        println "Saving transform"
        putTransform()
        println "Saving extension"
        putExtension()
        println "configuring JSON errors"
        configureJSONErrors()
        println "Done"
    }

    void putTransform() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":" + project.markLogicPort + "/v1/config/transforms/related")
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))


        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.contentType = "application/xquery"
        params.body = RESTConfigureTask.class.getResource('/related-result-transform.xqy').openStream().text
        try {
            client.put(params)
        }
        catch (ex) {
            println ex
        }
    }

    void putExtension() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":" + project.markLogicPort + "/v1/ext/tagged-with.xqy")
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.contentType = "application/xquery"
        params.body = RESTConfigureTask.class.getResource('/tagged-with.xqy').openStream().text
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
