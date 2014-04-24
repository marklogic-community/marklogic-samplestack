import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicClearTask extends MarkLogicTask {

    def config = "database/manage-properties.json"

    @TaskAction
    void updateDatabase() {
        println "Saving Database Configuration"
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/manage/v2/databases/" + project.applicationName)
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.contentType = "application/json"
        params.body = '{"operation":"clear-database"}'
        post(client,params)
    }

}
