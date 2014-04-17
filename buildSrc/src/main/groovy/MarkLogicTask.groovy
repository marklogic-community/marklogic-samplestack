import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicTask extends DefaultTask {

    protected put(client, params) {
        try {
            def response = client.put(params)
            println "Success: " + response.status
        }
        catch (ex) {
            println "Error: " + ex
        }
    }

    protected post(client, params) {
        try {
            def response = client.post(params)
            println "Success: " + response.status
        }
        catch (ex) {
            println "Error: " + ex
        }
    }

}
