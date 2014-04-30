import groovy.json.*
import groovyx.net.http.RESTClient
import java.util.zip.GZIPInputStream
import java.net.URL
import java.util.regex.Pattern
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction


public class MarkLogicSlurpTask extends MarkLogicTask {

    String seedDirectory = "database/seed-data"

    void putJson(client, uri, jsonObject) {
        client.auth.basic project.restWriterUser, project.restWriterPassword
        def params = [:]
        params.path = "/v1/documents"
        params.queryString = "uri="+uri
        params.contentType = "application/json"
		params.body = jsonObject
        client.put(params)
    }

    @TaskAction
    void load() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":" + project.markLogicPort)
        def jsonFiles = project.fileTree(dir: seedDirectory).matching { include '**/*.json' }
        println jsonFiles
        jsonFiles.each { 
            def pattern = Pattern.compile(".*" + seedDirectory)
            def docUri = it.path.replaceAll(pattern, "")
            println it.text
            println "PUT a JSON object to " + docUri
            putJson(client, docUri, it.text)
        }
    }
}
