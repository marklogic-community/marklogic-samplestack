import groovy.json.*
import groovyx.net.http.RESTClient
import java.util.zip.GZIPInputStream
import java.net.URL
import java.util.regex.Pattern
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction
import com.marklogic.client.io.BytesHandle
import com.marklogic.client.document.ServerTransform


public class MarkLogicSlurpTask extends MarkLogicTask {

    String seedDirectory = "database/seed-data"
    

	private writerClient() {
		RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port)
		client.auth.basic config.marklogic.writer.user, config.marklogic.writer.password
		client.getEncoder().putAt("application/n-triples", client.getEncoder().getAt("text/plain"))
		return client
	}
	
    void putRdf(client, uri, rdftriples) {
        def params = [:]
        params.path = "/v1/graphs"
        params.queryString = "graph="+uri
        params.contentType = "application/n-triples"
		params.body = new String(rdftriples.getBytes("UTF-8"))
        client.put(params)
    }

    @TaskAction
    void load() {
		RESTClient client = writerClient()
        def jsonFiles = project.fileTree(dir: "../../" + seedDirectory).matching { include '**/*.json' 
include '**/*.nt'}
        def BATCH_SIZE = 300
        def numWritten = 0
        def writeSet = docMgr.newWriteSet()
        def contribWriteSet = docMgr.newWriteSet()
        def transform = new ServerTransform("contrib-to-pojo")
        jsonFiles.each { 
            def pattern = Pattern.compile(".*" + "seed-data")
            def docUri = it.path.replaceAll(pattern, "").replaceAll("\\\\", "/")
            if (it.path.contains("dbpedia")) {
                logger.info("PUT RDF data to graph " + docUri)
                putRdf(client, docUri, it.text)
            }
            else {
                logger.info("Adding a JSON object: " + docUri)
                numWritten++;
                if ( numWritten % BATCH_SIZE == 0) {
                    logger.info("Writing batch")
                    docMgr.write(contribWriteSet, transform)
                    docMgr.write(writeSet)
                    writeSet = docMgr.newWriteSet()
                    contribWriteSet = docMgr.newWriteSet()
                }
                if (it.path.contains("contributors")) {
                    docUri = docUri.replaceAll(~"/contributors/", "com.marklogic.samplestack.domain.Contributor/")
                    contribWriteSet.add(docUri, new BytesHandle(it.text.getBytes("UTF-8")))
                } else {
                    writeSet.add(docUri, new BytesHandle(it.text.getBytes("UTF-8")))
                }
            }
        }
        if (numWritten % BATCH_SIZE > 0) {
            docMgr.write(writeSet)
            docMgr.write(contribWriteSet, transform)
        }
    }
}
