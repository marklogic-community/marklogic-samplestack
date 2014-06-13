import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicTask extends DefaultTask {

    protected props = new Properties()

    MarkLogicTask() {
        super()
        project.file("gradle.properties").withInputStream { props.load(it) }
        ext.config = new ConfigSlurper().parse(props)
    }

    protected put(client, params) {
        try {
            def response = client.put(params)
            logger.info("Success: " + response.status)
        }
        catch (ex) {
            logger.error("HTTPError: " + ex.getMessage())
        }
    }

    protected post(client, params) {
        try {
            def response = client.post(params)
            logger.info("Success: " + response.status)
        }
        catch (ex) {
            logger.error("HTTPError: " + ex.getMessage())
        }
    }

}
