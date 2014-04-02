import groovy.json.*
import groovyx.net.http.RESTClient
import java.util.zip.GZIPInputStream
import java.net.URL
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction


public class GithubSlurpTask extends DefaultTask {

    String file 
    String url

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
        InputStream inputStream
        if (url) {
            def tmpFile = File.createTempFile("temp",".gz")
            tmpFile.deleteOnExit()
            def fout = new FileOutputStream(tmpFile)
            def out = new BufferedOutputStream(fout)
            out << new URL(url).openStream()
            out.close()
            inputStream = new GZIPInputStream(new FileInputStream(tmpFile))
        }
        else {
            inputStream = new FileInputStream(new File( file ))
        }
        def input = inputStream.text.replaceAll(~"\\}\\{", "}\n{")
        def slurper = new JsonSlurper()
            def jsonObjects = input.eachLine({ 
                println it
                try {
                    slurper.parseText( it ) 
                }
                catch (ex) {
                    // parser error
                    println "parser error: " + it
                }
            }
            )
            jsonObjects.each{ 
                postJson(client, it)
                    println "Posted a JSON object" 
        }
    }
}
