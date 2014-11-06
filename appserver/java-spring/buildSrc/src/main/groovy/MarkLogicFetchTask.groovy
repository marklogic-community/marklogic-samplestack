import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicFetchTask extends MarkLogicTask {

    String url
    File destFile

    @TaskAction
    void fetchSeedData() {
        logger.warn("Fetching data from " + url)
        def is = new URL(url).openStream()
        destFile << is

    }

}
