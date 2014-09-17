import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicTeardownTask extends MarkLogicTask {

    @TaskAction
    void teardown() {
        removeUsers()
        teardownRest()
    }

    void teardownRest() {
		RESTClient client = bootstrapClient();
		def params = [:]
        params.queryString = "include=content&include=modules"
        try {
            client.delete(params)
        } catch (ex) {
            logger.error("REST Teardown failed: " + ex.response.status)
        }
    }

    void removeUsers() {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/users/samplestack-admin")
        def params = [:]
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
        client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/users/samplestack-guest")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
        client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/users/samplestack-contributor")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
        client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/roles/samplestack-guest")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
        client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/roles/samplestack-writer")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
    }

}
