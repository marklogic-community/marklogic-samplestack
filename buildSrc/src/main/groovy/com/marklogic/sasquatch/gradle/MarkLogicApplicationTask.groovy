import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicApplicationTask extends DefaultTask {

    @TaskAction
    void managePackage() {
        println "Saving Package"
        putPackage()
        println "Installing Package"
        installPackage()
        println "Done"
    }

    void putPackage() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/manage/v2/packages")
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.query = ["pkgname": name ]
        params.contentType = "application/json"
        params.body = MarkLogicApplicationTask.class.getResource('/app-package.json').openStream().text
        println(params.body)
        try {
            client.post(params)
        }
        catch (ex) {
            println ex.response.data
        }
    }

    void installPackage() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/manage/v2/packages/"+ project.applicationName + "/install")
        client.auth.basic project.adminUsername, project.adminPassword
        def params = [:]
        params.contentType = "application/json"
        params.body = "{}"
        try {
            client.post(params)
        }
        catch (ex) {
            println ex.response.status
            println ex.response.statusLine
        }
    }
}
