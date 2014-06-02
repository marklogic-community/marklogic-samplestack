import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicClearTask extends MarkLogicTask {

    @TaskAction
    void updateDatabase() {
        println "Saving Database Configuration"
        RESTClient client = new RESTClient("http://" + project.marklogic.rest.host + ":8002/manage/v2/databases/" + project.marklogic.rest.name)
        client.auth.basic project.marklogic.admin.user, project.marklogic.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = '{"operation":"clear-database"}'
        post(client,params)
    }

}
