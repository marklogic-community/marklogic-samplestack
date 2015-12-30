import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction
import com.marklogic.client.DatabaseClientFactory
import com.marklogic.client.DatabaseClientFactory.Authentication

public class MarkLogicTask extends DefaultTask {

    protected props = new Properties()
    protected client
    protected docMgr

    MarkLogicTask() {
        super()
        project.file("gradle.properties").withInputStream { props.load(it) }
        ext.config = new ConfigSlurper().parse(props)
        client = DatabaseClientFactory.newClient(
        	config.mlHost,
        	Integer.parseInt(config.mlRestPort),
        	config.marklogic.writer.user,
        	config.marklogic.writer.password,
        	Authentication.DIGEST)
        docMgr = client.newJSONDocumentManager()
    }
}
