import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.Project
import org.gradle.api.tasks.*



public class MarkLogicInitTask extends MarkLogicTask {

    def roles
    def users
    def privileges



    @TaskAction
    void initMarkLogic() {
        adminInit()
        adminSetup()
        createUsers()
        restBoot()
    }

    void adminInit() {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8001/admin/v1/init")
        def params = [:]
        params.contentType = "application/json"
        params.body = "{}"
        try {
            client.post(params)
            logger.warn("MarkLogic initialized.  Waiting for server restart.")
            Thread.sleep(5000)
        }
        catch (ex) { 
            if ( ex.response.status == 401 )
                logger.warn("Server already secured.  Initialization skipped.")
            else if ( ex.response.status == 500 )
                logger.warn("Server already initialized.  Initialization skipped")
            else 
               throw ex;
        }
    }

    void adminSetup() {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8001/admin/v1/instance-admin")
        def params = [:]
        params.contentType = "application/json"
        params.body = String.format('{ "admin-username" : "%s", "admin-password" : "%s", "realm" : "public" }', config.marklogic.admin.user, config.marklogic.admin.password)
        try {
            client.post(params)
            logger.warn("MarkLogic admin secured.  Waiting for server restart.")
            Thread.sleep(5000)
        }
        catch (ex) { 
            if ( ex.response.status == 401 )
                logger.warn("Server already secured.  Initialization skipped")
            else 
                logger.warn("Got " + ex.response.status)
        }
    }

    private void create(path, jsonObject) {
        try {
            RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/" + path)
            client.headers."accept" = "application/json"
            client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        
            def params = [:]
            params.contentType = "application/json"
            params.body = jsonObject.text
            client.post(params)
        } catch (ex) {
          if (ex.response) 
            { 
                logger.warn("" + ex.response.data)
            }
          else 
            { 
                logger.warn("No response")
            }
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
            RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/manage/v2/privileges/" + privilegeName + "/properties")
            client.headers."accept" = "application/json"
            client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
            def params = [:]
            params.queryString = "database=Security&kind=execute"
            params.contentType = "application/json"
            params.body = jsonRole.text
            client.put(params)
        } catch (ex) {
            logger.error("Error creating security object.  Privilege name: " + privilegeName + ". Payload: "+jsonRole.text+" .  Skipping...")
        }

    }

    void createUsers() {
        logger.warn("Creating users, roles, and privileges if absent...")
        roles.listFiles().each { createRole(it) }
        privileges.listFiles().each { assignPrivileges(it) }
        users.listFiles().each { createUser(it) }
    }

    void restBoot() {
        RESTClient client = new RESTClient("http://" + config.marklogic.rest.host + ":8002/v1/rest-apis").with {
            headers."accept" = "application/json"
            auth.basic config.marklogic.admin.user, config.marklogic.admin.password
            it
        }
        def params = [:]
        params.contentType = "application/json"
        params.body = String.format('{"rest-api" : { "name" : "%s", "port" : %s }}', config.marklogic.rest.name, config.marklogic.rest.port)
        try {
            post(client, params)
        } catch (ex) {
            logger.warn("Ignoring server creation error... ")
        }
    }
}
