import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicTeardownTask extends DefaultTask {

    @TaskAction
    void teardown() {
        removeUsers()
        teardownRest()
    }

    void teardownRest() {
        RESTClient client = new RESTClient("http://" + project.marklogic.rest.host + ":8002/v1/rest-apis/" + project.applicationName)
        client.auth.basic project.adminUser, project.adminPassword
        def params = [:]
        params.queryString = "include=content&include=modules"
        try {
            client.delete(params)
        } catch (ex) {
            println "REST Teardown failed: " + ex.response.status
        }
    }

    void removeUsers() {
        RESTClient client = new RESTClient("http://" + project.marklogic.rest.host + ":8002/manage/v2/users/rest-admin")
        def params = [:]
        client.auth.basic project.adminUser, project.adminPassword
        client.delete(params)
        client = new RESTClient("http://" + project.marklogic.rest.host + ":8002/manage/v2/users/samplestack-anonymous")
        client.auth.basic project.adminUser, project.adminPassword
        client.delete(params)
        client = new RESTClient("http://" + project.marklogic.rest.host + ":8002/manage/v2/users/samplestack-contributor")
        client.auth.basic project.adminUser, project.adminPassword
        client.delete(params)
        client = new RESTClient("http://" + project.marklogic.rest.host + ":8002/manage/v2/roles/samplestack-restricted")
        client.auth.basic project.adminUser, project.adminPassword
        client.delete(params)
        client = new RESTClient("http://" + project.marklogic.rest.host + ":8002/manage/v2/roles/samplestack-unrestricted")
        client.auth.basic project.adminUser, project.adminPassword
        client.delete(params)
    }

}
