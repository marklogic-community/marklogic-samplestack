import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicApplicationTask extends DefaultTask {

    def indexes = "src/main/server/indexes"

    @TaskAction
    void updateDatabase() {
        def indexesDirectory = new File(indexes)
        println "Saving Database Configuration"
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/manage/v2/databases/" + project.applicationName + "/properties")
        client.auth.basic project.adminUsername, project.adminPassword
        indexesDirectory.listFiles().each { 
            print "Found config file " +  it.name + "..."
            def params = [:]
            params.contentType = "application/json"
            params.body = it.text
            try {
                def response = client.put(params)
                println response.status
            }
            catch (ex) {
                println "Error: " + ex.response.data
            }
        }
        println "Done"
    }

}
