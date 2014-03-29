import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicTeardownTask extends DefaultTask {

    @TaskAction
    void teardownRest() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/v1/rest-apis/" + project.applicationName)
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.queryString = "include=content&include=modules"
        try {
            client.delete(params)
        } catch (ex) {
            println "REST Teardown failed: " + ex.response.status
        }
    }

}
