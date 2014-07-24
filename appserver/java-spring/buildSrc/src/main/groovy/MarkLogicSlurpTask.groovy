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
        client.auth.basic config.marklogic.writer.user, config.marklogic.writer.password
        def params = [:]
        params.path = "/v1/documents"
        params.queryString = "uri="+uri
        params.contentType = "application/json"
        // check accepted status for questions
        if (jsonObject.contains("acceptedAnswerId")) {
            params.queryString += "&perm:samplestack-guest=read"
        }
		params.body = jsonObject
        client.put(params)
    }

    void putRdf(client, uri, rdftriples) {
        client.auth.basic config.marklogic.writer.user, config.marklogic.writer.password
        client.getEncoder().putAt("application/n-triples", client.getEncoder().getAt("text/plain"))
        def params = [:]
        params.path = "/v1/graphs"
        params.queryString = "graph="+uri
        params.contentType = "application/n-triples"
		params.body = rdftriples
        client.put(params)
    }

    @TaskAction
    void load() {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port)
        def jsonFiles = project.fileTree(dir: "../../" + seedDirectory).matching { include '**/*.json' 
include '**/*.nt'}
        jsonFiles.each { 
            def pattern = Pattern.compile(".*" + "seed-data")
            def docUri = it.path.replaceAll(pattern, "").replaceAll("\\", "/")
            if (it.path.contains("dbpedia")) {
                logger.info("PUT RDF data to graph " + docUri)
                putRdf(client, docUri, it.text)
            }
            else {
                logger.info("PUT a JSON object to " + docUri)
                putJson(client, docUri, it.text)
            }
        }
    }
}
