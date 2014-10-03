import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicClearTask extends MarkLogicTask {

    @TaskAction
    void updateDatabase() {
        logger.error("Saving Database Configuration")
        RESTClient client = manageClient("databases/" + config.marklogic.rest.name)
        def params = [:]
        params.contentType = "application/json"
        params.body = '{"operation":"clear-database"}'
        post(client,params)
    }

}
