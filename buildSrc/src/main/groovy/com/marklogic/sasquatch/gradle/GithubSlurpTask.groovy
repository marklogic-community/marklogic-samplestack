import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction


public class GithubSlurpTask extends DefaultTask {

    String file 

    void postJson(client, jsonObject) {
        client.auth.basic project.applicationUser, project.applicationPassword
        def params = [:]
        params.path = "/v1/documents"
        params.queryString = "directory=/github/&extension=json"
        params.contentType = "application/json"
		params.body = jsonObject
        println (client.post(params))
    }

    @TaskAction
    void loadGithub() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":" + project.markLogicPort)
        def slurper = new JsonSlurper()
        def input = new File( file ).text.replaceAll(~"\\}\\{", "}XXXXXXXX{")
        def jsonObjects = input.splitEachLine(~"XXXXXXXX", { it.each { slurper.parseText( it ) }})
        jsonObjects.each{ 
            postJson(client, it)
            println "Posted a JSON object" 
        }
    }
}
