import org.gradle.api.Plugin
import org.gradle.api.Project


public class SpawnOngoingPlugin implements Plugin<Project> {
  static final String CONFIGURATION_NAME = 'spawnOngoing'

  void apply(final Project project) {
    project.configurations.create(CONFIGURATION_NAME)

    project.extensions.create("spawnOngoing", SpawnOngoingPluginExtension)

    project.tasks.create('spawnOngoing', SpawnOngoingTask)

  }
}

public class SpawnOngoingPluginExtension {
  String processName
  Process process
  Thread errorStream
  Thread outputStream

  // I don't know of a gradle event to hook for this
  void kill() {
    errorStream.close()
    outputStream.close()
    process.destroy()
    println "Shut down " + processName
  }
}
