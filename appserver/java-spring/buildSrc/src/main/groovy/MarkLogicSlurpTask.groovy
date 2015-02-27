import groovy.json.*
import groovyx.net.http.RESTClient
import java.util.zip.GZIPInputStream
import java.net.URL
import java.util.regex.Pattern
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction
import com.marklogic.client.io.BytesHandle
import com.marklogic.client.io.Format
import com.marklogic.client.document.ServerTransform
import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.client.io.DocumentMetadataHandle.Capability


public class MarkLogicSlurpTask extends MarkLogicTask {

    File seedDirectory 

	private writerClient() {
		RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port)
		client.auth.basic config.marklogic.writer.user, config.marklogic.writer.password
		client.getEncoder().putAt("application/n-triples", client.getEncoder().getAt("text/plain"))
		client.getParser().putAt("application/n-triples", client.getParser().getAt("text/plain"))
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

    void updateRdfPermissions(client, graphName) {
        logger.info("Updating permissions on RDF triples");
        def params = [:]
        params.path = "/v1/resources/graphPermSetter"
        params.contentType = "application/json"
		params.body = new String("{\"graphName\":\"" + graphName + "\"}")
        client.put(params)
    }

    @TaskAction
    void load() {
		RESTClient client = writerClient()
        def jsonFiles = project.fileTree(seedDirectory).matching { include '**/*.json' 
include '**/*.nt'}
        def BATCH_SIZE = 300
        def numWritten = 0
        def writeSet = docMgr.newWriteSet()
        def acceptedPermissionMetadata = new DocumentMetadataHandle().withPermission("samplestack-guest", Capability.READ)
        def pojoCollectionMetadata = new DocumentMetadataHandle().withCollections("com.marklogic.samplestack.domain.Contributor").withPermission("samplestack-guest", Capability.READ)
        jsonFiles.each { 
            def pattern = Pattern.compile(".*" + seedDirectory.name)
            def docUri = it.path.replaceAll(pattern, "").replaceAll("\\\\", "/")
            if (it.path.contains("dbpedia")) {
                logger.info("PUT RDF data to graph " + docUri)
                putRdf(client, docUri, it.text)
                updateRdfPermissions(client, docUri);
            }
            else {
                logger.info("Adding a JSON object: " + docUri)
                numWritten++;
                if ( numWritten % BATCH_SIZE == 0) {
                    logger.info("Writing batch")
                    docMgr.write(writeSet)
                    writeSet = docMgr.newWriteSet()
                }
                def bh = new BytesHandle(it.text.getBytes("UTF-8")).withFormat(Format.JSON)
                if (it.text.contains("accepted\":true")) {
                    writeSet.add(docUri, acceptedPermissionMetadata, bh)
                } else if (it.text.contains("domain.Contributor")) {
                    docUri = docUri.replaceAll("^\\/","")
                    writeSet.add(docUri, pojoCollectionMetadata, bh)
                } else {
                    writeSet.add(docUri, bh)
                }
            }
        }
        if (numWritten % BATCH_SIZE > 0) {
            docMgr.write(writeSet)
        }

    }

}
