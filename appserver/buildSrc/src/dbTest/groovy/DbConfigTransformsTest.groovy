import groovy.json.*
import groovyx.net.http.RESTClient

import org.junit.Test
import static org.junit.Assert.*


public class DBConfigTransformsTest extends DbTests {

    @Test
    void askTransform() {
        println "Testing ASK transform"
        
        def input = """
                     {"title": "What is my first question?",
					  "body": "Its body is suspiciously short, like a unit tests.",
					  "id": "/test/1.json"
					  }
					  """
		RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + 
		         config.marklogic.rest.port + "/v1/documents?uri=/test/1.json&transform=ask")
		
        client.auth.basic config.marklogic.writer.user, config.marklogic.writer.password
        def params = [:]
        params.contentType = "application/json"
        params.body = input
        client.put(params)
        
        params = [:]
        def jsonResponse = client.get(params).getData()
       
        assertTrue("jsonResponse missing creationDate key", jsonResponse.creationDate != null)
        assertEquals("jsonResponse has comments array", [], jsonResponse.comments)
        assertEquals("jsonResponse has answers array", [], jsonResponse.answers)
   
    }

}