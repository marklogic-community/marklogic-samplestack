import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.OutputFile
import org.gradle.api.tasks.Input

public class MarkLogicFetchTask extends MarkLogicTask {

    @Input
    String url

    @OutputFile
    File destFile

    @TaskAction
    void fetchSeedData() {
        logger.warn("Fetching data from " + url)
        def is = new URL(url).openStream()

        try {
            OutputStream os = new FileOutputStream(destFile);
            boolean finished = false;
            try {
                byte[] buf = new byte[1024 * 10];
                int read;
                while ((read = is.read(buf)) >= 0) {
                    os.write(buf, 0, read);
                }
                os.flush();
                finished = true;
            } finally {
                os.close();
                if (!finished) {
                    destFile.delete();
                }
            }
        } finally {
            is.close();
        }
    }

}
