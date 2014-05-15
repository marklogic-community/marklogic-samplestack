import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.*



public class MarkLogicInitTask extends MarkLogicTask {

    def roles = "database/security/roles"
    def users = "database/security/users"
    def privileges = "database/security/privileges"

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
        params.body = String.format('{ "admin-username" : "%s", "admin-password" : "%s", "realm" : "public" }',project.adminUser, project.adminPassword)
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

    private void create(path, jsonObject) {
        try {
            RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/manage/v2/" + path)
            client.headers."accept" = "application/json"
            client.auth.basic project.adminUser, project.adminPassword
        
            def params = [:]
            params.contentType = "application/json"
            params.body = jsonObject.text
            client.post(params)
        } catch (ex) {
            println "Error creating security object.  Payload: "+jsonObject.text+" .  Skipping..."
        }
    }

    void createUser(jsonUser) {
        create("users", jsonUser)
    }

    void createRole(jsonRole) {
        create("roles", jsonRole)
    }

    void assignPrivileges(jsonRole) {
        def privilegeName = jsonRole.name.replaceAll(~".json","")
        try {
            RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/manage/v2/privileges/" + privilegeName + "/properties")
            client.headers."accept" = "application/json"
            client.auth.basic project.adminUser, project.adminPassword
        
            def params = [:]
            params.queryString = "database=Security&kind=execute"
            params.contentType = "application/json"
            params.body = jsonRole.text
            client.put(params)
        } catch (ex) {
            println "Error creating security object.  Privilege name: " + privilegeName + ". Payload: "+jsonRole.text+" .  Skipping..."
        }

    }

    void createUsers() {
        def rolesDirectory = new File(roles)
        rolesDirectory.listFiles().each { createRole(it) }
        def privilegesDirectory = new File(privileges)
        privilegesDirectory.listFiles().each { assignPrivileges(it) }
        def usersDirectory = new File(users)
        usersDirectory.listFiles().each { createUser(it) }
    }

    void restBoot() {
        RESTClient client = new RESTClient("http://" + project.markLogicHost + ":8002/v1/rest-apis").with {
            headers."accept" = "application/json"
            auth.basic project.adminUser, project.adminPassword
            it
        }
        def params = [:]
        params.contentType = "application/json"
        params.body = String.format('{"rest-api" : { "name" : "%s", "port" : %s }}', project.applicationName, project.markLogicPort)
        try {
            post(client, params)
        } catch (ex) {
            println "Ignoring server creation error... "
        }
    }
}
