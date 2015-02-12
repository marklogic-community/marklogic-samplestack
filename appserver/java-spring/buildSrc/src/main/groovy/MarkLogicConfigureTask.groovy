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

    def sep = java.io.File.separator
    def database = "database"
    def dbProperties = database + sep + "database-properties.json"
    def transforms = database + sep + "transforms"
    def restExtensions = database + sep + "ext"
    def restServices = database + sep +"services"
    def options = database + sep + "options"
    def restProperties = database + sep + "rest-properties.json"
    def file = null


    @TaskAction
    void configureREST(IncrementalTaskInputs inputs) {
        logger.info(inputs.incremental ? "CHANGED inputs considered out of date" : "ALL inputs considered out of date")
        logger.debug("File Separator: " + sep)
        inputs.outOfDate { change -> 
            logger.debug("out of date: ${change.file.name}")
            def targetFile = new File(outputDir, change.file.name)
            targetFile.text = "done"
            logger.debug("Processing file " + change.file.path)
            def changeFile = change.file
            if (changeFile.path =~ /\/\./) {
                logger.info("Skipping hidden file " + change.file.name)
            }
            else if (changeFile.path =~ /seed-data/) {
                logger.info("Skipping seed data") 
            }
            else if (changeFile.path.contains(transforms)) {
                logger.warn("Putting transform " + change.file.name)
                putTransform(changeFile)
            }
            else if (changeFile.path.contains(restExtensions)) {
                logger.warn("Putting library extension " + change.file.name)
                putExtension(changeFile)
            }
            else if (changeFile.path.contains(restServices)) {
                logger.warn("Putting service extension " + change.file.name)
                putServiceExtension(changeFile)
            }
            else if (changeFile.path.contains(options)) {
                logger.warn("Putting search options " + change.file.name)
                putOptions(changeFile)
            }
            else if (changeFile.path.contains(dbProperties)) {
                logger.warn("Putting database configuration " + change.file.name)
                putDatabaseConfig(changeFile)
            }
            else if (changeFile.path.contains(restProperties)) {
                putRESTProperties(changeFile)
            } 
            else if (changeFile.path.contains("security")) {
                logger.info("Skipping security configuration" + change.file.name)
            } else {
                logger.warn("Looks like " + change.file.path + " is not a MarkLogic configuration file... skipping")
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
        def transformName = transformFileName.split("/")[-1].replaceAll(~"\\.[^\\.]+", "")
        if (transformName) {
            logger.info( "Saving transform " + transformName)
            RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/transforms/" + transformName)
            client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
            client.getEncoder().putAt("application/javascript", client.getEncoder().getAt("text/plain"))
            client.getEncoder().putAt("application/vnd.marklogic-javascript", client.getEncoder().getAt("text/plain"))
            client.getParser().putAt("application/vnd.marklogic-javascript", client.getParser().getAt("text/plain"))
            client.getParser().putAt("*/*", client.getParser().getAt("application/json"))
            client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
            def params = [:]
            if (transformFileName.endsWith("sjs")) {
                params.contentType = "application/javascript";
            } else {
                params.contentType = "application/xquery"
            }
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
        logger.info( "Saving library extension " + extensionFileName)
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/ext/" + extensionName)
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
        client.getEncoder().putAt("application/javascript", client.getEncoder().getAt("text/plain"))
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        if (extensionFileName.endsWith("sjs")) {
            params.contentType = "application/javascript"
        } else {
            params.contentType = "application/xquery"
        }
        params.body = extension.text
        put(client,params)
    }

    void putServiceExtension(extension) {
        def extensionFileName = extension.getPath().replaceAll(~"\\\\","/")
        def extensionName = 
            extensionFileName.replaceAll(~".*\\/","").replaceAll(~"\\.(sjs|xqy)","")
        logger.info( "Saving service extension " + extensionFileName)
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/resources/" + extensionName)
        client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
        client.getEncoder().putAt("application/javascript", client.getEncoder().getAt("text/plain"))
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        if (extensionFileName.endsWith("sjs")) {
            params.contentType = "application/javascript"
        } else {
            params.contentType = "application/xquery"
        }
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

