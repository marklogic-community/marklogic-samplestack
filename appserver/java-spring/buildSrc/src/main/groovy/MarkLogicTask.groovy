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
        	config.marklogic.rest.host,
        	Integer.parseInt(config.marklogic.rest.port),
        	config.marklogic.writer.user,
        	config.marklogic.writer.password,
        	Authentication.DIGEST)
        docMgr = client.newJSONDocumentManager()
    }
    
    protected storeJson(uri, handle) {
        docMgr.write(uri, handle);
    }
    

    protected put(client, params) {
        try {
            def response = client.put(params)
            logger.warn("Success: " + response.status)
        } catch (ex)
        { 
          if (ex.response) 
          {
             logger.warn("" + ex.response.data) 
          }
          else 
          {
             logger.warn("No response") 
          }
        }
    }

    protected post(client, params) {
        try {
            def response = client.post(params)
            logger.warn("Success: " + response.status)
        } catch (ex)
        { 
          if (ex.response) 
            { 
                logger.warn("" + ex.response.data)
            }
          else 
            { 
                logger.warn("No response")
            }
        }
    }

}
