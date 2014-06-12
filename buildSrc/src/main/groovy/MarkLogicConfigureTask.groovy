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

    def dbProperties = "db-config/database-properties.json"
    def dbConfig = "db-config"
    def transforms = dbConfig + "/transforms"
    def restExtensions = dbConfig + "/ext"
    def services = dbConfig + "/services"
    def options = dbConfig + "/options"
    def restProperties = dbConfig + "/rest-properties.json"
    def file = null

    
    @TaskAction
    void configureREST(IncrementalTaskInputs inputs) {
        println inputs.incremental ? "CHANGED inputs considered out of date" : "ALL inputs considered out of date"
        inputs.outOfDate { change -> 
            println "out of date: ${change.file.name}"
            def targetFile = new File(outputDir, change.file.name)
            targetFile.text = "done"
            println "Processing file " + change.file.path
            def changeFile = change.file
            if (change.file.path.contains(transforms)) {
                putTransform(changeFile)
            }
            else if (change.file.path.contains(restExtensions)) {
                putExtension(changeFile)
            }
            else if (change.file.path.contains(services)) {
                putServiceExtension(changeFile)
            }
            else if (change.file.path.contains(options)) {
                putOptions(changeFile)
            }
            else if (change.file.path.contains(dbProperties)) {
                putDatabaseConfig()
            }
            else if (change.file.path.contains(restProperties)) {
                putRESTProperties()
            } else {
                println "No handler for file " + change.file.path
            }
        }

        inputs.removed { change ->
            println "removed: ${change.file.name}"
            def targetFile = new File(outputDir, change.file.path)
            targetFile.delete()
        }

//        FileTree fileTree = project.fileTree(dbConfig)
//        // if caller passed a file, just process that
//        if (file != null) {
//           println file
//           fileTree.include(file)
//        } else {
//        // otherwise traverse db-config
//           fileTree.include('**').exclude('**/.*').exclude('security/**').exclude('seed-data/**')
//        }
//        fileTree.each {
        //}
    }

    void putDatabaseConfig() {
        println "Saving Database Configuration"
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/databases/" + config.marklogic.rest.name + "/properties")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = project.file(dbProperties).text
        put(client,params)
    }

    void putTransform(transform) {
        def transformFileName = transform.getPath().replaceAll(~"\\\\","/")
        def transformName = transformFileName.replaceAll(~"\\.[^\\.]+", "").replaceAll(~".*\\/","")

        if (transformName) {
            println "Saving transform " + transformName
            RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/transforms/" + transformName)
            client.getEncoder().putAt("application/xquery", client.getEncoder().getAt("text/plain"))
            client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
            def params = [:]
            params.contentType = "application/xquery"
            params.body = transform.text
            put(client, params)
        }
        else {
            println "Skipping filename " + transformName
        }
    }

    void putExtension(extension) {
        def extensionFileName = extension.getPath().replaceAll(~"\\\\","/")
        def extensionName = 
            extensionFileName.replaceAll(~".*\\/","")
        println "Saving extension " + extensionFileName
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
        println "Saving extension " + extensionFileName
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
        println "Saving options " + optionsFileName
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/query/" + optionsName)
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = options.text
        put(client,params)
    }

    void putRESTProperties() {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":" + config.marklogic.rest.port + "/v1/config/properties")
        client.auth.basic config.marklogic.rest.admin.user, config.marklogic.rest.admin.password
        def params = [:]
        params.contentType = "application/json"
        params.body = new File(restProperties).text
        println "Configuring Properties"
        put(client,params)
    }
}

