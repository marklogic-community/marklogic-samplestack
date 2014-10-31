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

	/* returns a client that can use port 8002 to nanage MarkLogic */
	protected manageClient(String url) {
		RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/" + url)
		client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password	
		return client;
	}

	/* returns a client that can bootstrap and teardown REST APIs */
	protected bootstrapClient() {
		RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/v1/rest-apis/" + config.marklogic.rest.name)
		client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
		return client;
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
             logger.warn("" + ex.response.data.text) 
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

	protected void delay() {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8001/admin/v1/timestamp")
        def params = [:]
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        try {
			Thread.sleep(1000)
            client.get(params)
        } catch (ex) {
			logger.warn("Waiting for server restart...");
            delay();
		}
	}
}
