import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.InputDirectory
import org.gradle.api.tasks.OutputDirectory
import org.gradle.api.tasks.Input
import org.gradle.api.file.FileCollection
import org.gradle.api.file.FileTree
import org.gradle.api.tasks.incremental.IncrementalTaskInputs

public class MarkLogicConfigureTask extends MarkLogicTask {

    @InputDirectory
    def File inputDir

    @OutputDirectory
    def File outputDir
    
    @Input
    def inputProperty

    def database = "database"
    def dbProperties = database + "/database-properties.json"
    def transforms = database + "/transforms"
    def restExtensions = database + "/ext"
    def services = database + "/services"
    def options = database + "/options"
    def restProperties = database + "/rest-properties.json"
    def file = null

    
    @TaskAction
    void configureREST(IncrementalTaskInputs inputs) {
        logger.info(inputs.incremental ? "CHANGED inputs considered out of date" : "ALL inputs considered out of date")
        inputs.outOfDate { change -> 
            logger.warn("out of date: ${change.file.name}")
            def targetFile = new File(outputDir, change.file.name)
            targetFile.text = "done"
            logger.warn("Processing file " + change.file.path)
            def changeFile = change.file
            if (changeFile.path =~ /\/\./) {
                logger.error("Skipping hidden file")
            }
            else if (changeFile.path.contains(transforms)) {
                putTransform(changeFile)
            }
            else if (changeFile.path.contains(restExtensions)) {
                putExtension(changeFile)
            }
            else if (changeFile.path.contains(services)) {
                putServiceExtension(changeFile)
            }
            else if (changeFile.path.contains(options)) {
                putOptions(changeFile)
            }
            else if (changeFile.path.contains(dbProperties)) {
                putDatabaseConfig(changeFile)
            }
            else if (changeFile.path.contains(restProperties)) {
                putRESTProperties(changeFile)
            } else {
                logger.info("No handler for file " + change.file.path)
            }
        }

        inputs.removed { change ->
            logger.debug( "removed: ${change.file.name}")
            def targetFile = new File(outputDir, change.file.path)
            targetFile.delete()
        }

    }

    void putDatabaseConfig(c) {
        logger.info( "Saving Database Configuration")
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/databases/" + config.marklogic.rest.name + "/properties")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = c.text
        put(client,params)
    }

    void putTransform(transform) {
        def transformFileName = transform.getPath().replaceAll(~"\\\\","/")
        def transformName = transformFileName.replaceAll(~"\\.[^\\.]+", "").replaceAll(~".*\\/","")

        if (transformName) {
            logger.info( "Saving transform " + transformName)
            RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/transforms/" + transformName)
            client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
            client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
            def params = [:]
            params.contentType = "application/xquery"
            params.body = transform.text
            put(client, params)
        }
        else {
            logger.debug( "Skipping filename " + transformName)
        }
    }

    void putExtension(extension) {
        def extensionFileName = extension.getPath().replaceAll(~"\\\\","/")
        def extensionName = 
            extensionFileName.replaceAll(~".*\\/","")
        logger.info( "Saving extension " + extensionFileName)
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/ext/" + extensionName)
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/xquery"
        params.body = extension.text
        put(client,params)
    }

    void putServiceExtension(extension) {
        def extensionFileName = extension.getPath().replaceAll(~"\\\\","/")
        def extensionName = 
            extensionFileName.replaceAll(~".*\\/","")
        logger.info( "Saving extension " + extensionFileName)
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/resources/" + extensionName)
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/xquery"
        params.body = extension.text
        put(client,params)
    }

    void putOptions(options) {
        def optionsFileName = options.getPath().replaceAll(~"\\\\","/").replaceAll(~"\\.json","")
        def optionsName = 
            optionsFileName.replaceAll(~".*\\/","")
        logger.info( "Saving options " + optionsFileName)
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/query/" + optionsName)
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = options.text
        put(client,params)
    }

    void putRESTProperties(File f) {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/properties")
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = f.text
        logger.info( "Configuring Properties")
        put(client,params)
    }
}

