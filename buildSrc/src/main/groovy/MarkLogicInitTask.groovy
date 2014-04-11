import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction



public class MarkLogicInitTask extends DefaultTask {

    @TaskAction
    void initMarkLogic() {
        adminInit()
        adminSetup()
        createUsers()
        restBoot()
    }

    void adminInit() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8001/admin/v1/init")
        def params = [:]
        params.contentType = "application/json"
        params.body = "{}"
        try {
            client.post(params)
            println "MarkLogic initialized.  Waiting for server restart."
            Thread.sleep(5000)
        }
        catch (ex) { 
            if ( ex.response.status == 401 )
                println "Server already secured.  Initialization skipped."
            else if ( ex.response.status == 500 )
                println "Server already initialized.  Initialization skipped"
            else 
               throw ex;
        }
    }

    void adminSetup() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8001/admin/v1/instance-admin")
        def params = [:]
        params.contentType = "application/json"
        params.body = String.format('{ "admin-username" : "%s", "admin-password" : "%s", "realm" : "public" }',project.adminUsername, project.adminPassword)
        try {
            client.post(params)
            println "MarkLogic admin secured.  Waiting for server restart."
            Thread.sleep(5000)
        }
        catch (ex) { 
            if ( ex.response.status == 401 )
                println "Server already secured.  Initialization skipped"
            else 
                println "Got " + ex.response.status
        }
    }


    
    void createUsers() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/manage/v2/users").with {
            headers."accept" = "application/json"
            auth.basic project.adminUsername, project.adminPassword
            it
        }
        
        def builder = new JsonBuilder()
        def root = builder { "user-properties" {
              "name" project.restWriterUser
              "password" project.restWriterPassword
              "description" "Rest Writer User"
              } 
        }
        def params = [:]
        
        params.contentType = "application/json"
        params.body = builder.toString()
        try {
            client.post(params)
        } catch (ex) {
            println ex
        }
    }

    //Milestone 1 only ?
    void restBoot() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/v1/rest-apis").with {
            headers."accept" = "application/json"
            auth.basic project.adminUsername, project.adminPassword
            it
        }
        def params = [:]
        params.contentType = "application/json"
        params.body = String.format('{"rest-api" : { "name" : "%s", "port" : %s }}', project.applicationName, project.markLogicPort)
        try {
            client.post(params)
        } catch (ex) {
            println "REST Bootstrap failed: " + ex
        }
    }
}
