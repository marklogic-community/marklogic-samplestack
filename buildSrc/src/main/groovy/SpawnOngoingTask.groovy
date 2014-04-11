import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction
// import org.gradle.process.internal.shutdown

class StreamGobbler extends Thread {
    InputStream is;
    String prefix;

    private StreamGobbler(InputStream is, String prefix) {
        this.is = is;
        this.prefix = prefix;
    }

    @Override
    public void run() {
        try {
            InputStreamReader isr = new InputStreamReader(is);
//            ShutdownHookActionRegister.addAction(this);
            BufferedReader br = new BufferedReader(isr);
            String line = null;
            while ((line = br.readLine()) != null)
                System.out.println(prefix + line)
        }
        catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }
}

public class SpawnOngoingTask extends DefaultTask {

    String command
    String processName
    String readySentinel
    String directory
    String errPrefix
    String outPrefix

    @TaskAction
    def spawnProcess() {

        ProcessBuilder builder = new ProcessBuilder().command(command.split(' '))
        builder.directory(new File(directory))
        Process p = builder.start()
        addShutdownHook {
            println "Shutting down " + processName
            p.terminate()
        }

        InputStream stdout = p.getInputStream()
        BufferedReader reader = new BufferedReader(new InputStreamReader(stdout))
        def line
        while ((line = reader.readLine()) != null) {
            System.out.println(line)
            if (line.contains(readySentinel)) {
                break;
            }
        }

        StreamGobbler errorGobbler = new StreamGobbler(p.getErrorStream(), errPrefix);
        StreamGobbler outputGobbler = new StreamGobbler(p.getInputStream(), outPrefix);
        project.extensions.spawnOngoing.process = p
        project.extensions.spawnOngoing.processName = processName

        project.extensions.spawnOngoing.errorStream = errorGobbler
        project.extensions.spawnOngoing.outputStream = outputGobbler
        errorGobbler.start()
        outputGobbler.start()
    }
}
