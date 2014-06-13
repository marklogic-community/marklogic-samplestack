import groovy.json.*


public class DbTests {


	protected config
	
    DbTests() {
        def props = new Properties()
    
        new File("../gradle.properties").withInputStream { props.load(it) }
        config = new ConfigSlurper().parse(props)
    }

}
