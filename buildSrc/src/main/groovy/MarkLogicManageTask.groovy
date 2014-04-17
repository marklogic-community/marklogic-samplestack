import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicManageTask extends MarkLogicTask {

    def config = "database/database-properties.json"

    @TaskAction
    void updateDatabase() {
        println "Saving Database Configuration"
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/manage/v2/databases/" + project.applicationName + "/properties")
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.contentType = "application/json"
        params.body = project.file(config).text
        put(client,params)
    }

}
