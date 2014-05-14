package com.marklogic.sampleStack.ldap;

import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

import org.apache.directory.server.core.DefaultDirectoryService;
import org.apache.directory.server.core.authn.AuthenticationInterceptor;
import org.apache.directory.server.core.entry.ServerEntry;
import org.apache.directory.server.core.exception.ExceptionInterceptor;
import org.apache.directory.server.core.interceptor.Interceptor;
import org.apache.directory.server.core.normalization.NormalizationInterceptor;
import org.apache.directory.server.core.operational.OperationalAttributeInterceptor;
import org.apache.directory.server.core.partition.impl.btree.jdbm.JdbmPartition;
import org.apache.directory.server.core.referral.ReferralInterceptor;
import org.apache.directory.server.core.subtree.SubentryInterceptor;
import org.apache.directory.server.ldap.LdapServer;
import org.apache.directory.server.ldap.handlers.bind.SimpleMechanismHandler;
import org.apache.directory.server.ldap.handlers.bind.digestMD5.DigestMd5MechanismHandler;
import org.apache.directory.server.protocol.shared.store.LdifFileLoader;
import org.apache.directory.server.protocol.shared.transport.TcpTransport;
import org.apache.directory.shared.ldap.exception.LdapNameNotFoundException;
import org.apache.directory.shared.ldap.name.LdapDN;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;

public class SampleStackLdapServer {

	final DefaultDirectoryService service;
	LdapServer server;
	private JdbmPartition partition;

	private final Logger logger = LoggerFactory
			.getLogger(SampleStackLdapServer.class);	
	
	private int port = 53389;

	public SampleStackLdapServer() throws Exception {
		service = new DefaultDirectoryService();
		List<Interceptor> list = new ArrayList<Interceptor>();

		list.add(new NormalizationInterceptor());
		list.add(new AuthenticationInterceptor());
		list.add(new ReferralInterceptor());
		// list.add( new AciAuthorizationInterceptor() );
		// list.add( new DefaultAuthorizationInterceptor() );
		list.add(new ExceptionInterceptor());
		// list.add( new ChangeLogInterceptor() );
		list.add(new OperationalAttributeInterceptor());
		// list.add( new SchemaInterceptor() );
		list.add(new SubentryInterceptor());
		// list.add( new CollectiveAttributeInterceptor() );
		// list.add( new EventInterceptor() );
		// list.add( new TriggerInterceptor() );
		// list.add( new JournalInterceptor() );

		service.setInterceptors(list);
		partition = new JdbmPartition();
		partition.setId("samplestack");
		partition.setSuffix("dc=samplestack,dc=org");
		service.addPartition(partition);
		JdbmPartition schemaPartition = new JdbmPartition();
		schemaPartition.setId("schema");
		schemaPartition.setSuffix("ou=schema");
		service.addPartition(schemaPartition);
		
		service.setExitVmOnShutdown(false);
		service.setShutdownHookEnabled(false);
		service.getChangeLog().setEnabled(false);
		service.setDenormalizeOpAttrsEnabled(false);
//		service.setAllowAnonymousAccess(true);
		service.setAccessControlEnabled(false);
		
		File workingDirectory = Files.createTempDirectory("samplestack-ldap").toFile();
		
		service.setWorkingDirectory(workingDirectory);
		
		
		server = new LdapServer();
		server.setDirectoryService(service);
		// default is false server.setConfidentialityRequired(false);
		
		//server.setMaxTimeLimit(15000);
		//SASL
		logger.error("uses qop?" + server.getSaslQopString());

		server.setSaslHost("cgreer-laptop");  //FIXME this needs config
		server.setSaslPrincipal("ldap/cgreer-laptop@SAMPLESTACK.ORG");
		server.setSearchBaseDn("ou=apps,dc=samplestack,dc=org");
		server.addSaslMechanismHandler("SIMPLE", new SimpleMechanismHandler());
		server.addSaslMechanismHandler("DIGEST-MD5", new DigestMd5MechanismHandler());
		List<String> realms = new ArrayList<String>();
		realms.add("samplestack.org");
		server.setSaslRealms(realms);
		server.setTransports(new TcpTransport(port));
		start();
	}

	public void destroy() throws Exception {
		server.stop();
	}

	public DefaultDirectoryService getService() {
		return service;
	}

	public void start() {
		
		if (service.isStarted()) {
			throw new IllegalStateException(
					"DirectoryService is already running.");
		}

		logger.info("Starting directory server...");
		try {
			service.startup();
			server.start();
		} catch (Exception e) {
			throw new RuntimeException("Server startup failed", e);
		}

		try {
			service.getAdminSession().lookup(partition.getSuffixDn());
		} catch (LdapNameNotFoundException e) {
			try {
				LdapDN dn = new LdapDN("dc=samplestack,dc=org");
				String dc = "samplestack";
				ServerEntry entry = service.newEntry(dn);
				entry.add("objectClass", "top", "domain", "extensibleObject");
				entry.add("dc", dc);
				service.getAdminSession().add(entry);
			} catch (Exception e1) {
				logger.error("Failed to create dc entry", e1);
			}
		} catch (Exception e) {
			logger.error("Lookup failed", e);
		}

		String ldifFile = new ClassPathResource("samplestack-server.ldif").getPath();
		logger.info("Loading LDIF file: " + ldifFile);
		LdifFileLoader loader = new LdifFileLoader(service.getAdminSession(),
				ldifFile);
		loader.execute();
	}
	
	
	public static void main(String args[]) throws Exception {
		SampleStackLdapServer s = new SampleStackLdapServer();
		
		System.out.println("OK, running");
		
		System.out.println("OK, running");
		
		
	}
}
