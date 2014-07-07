package com.marklogic.samplestack.web;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.stereotype.Component;

@EnableWebSecurity
@Component
@EnableGlobalMethodSecurity(prePostEnabled=true)
/**
 * The Spring Security configuration for Samplestack.
 * Contains configuration for the web-tier security,
 * including the embedded LDAP backend configuration and the
 * user-facing method for securing the application's endpoints.
 */
public class ApplicationSecurity extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests()
				.antMatchers(HttpMethod.GET, "/questions", "/tags")
				.permitAll()
				.and()
		    .authorizeRequests()
		        .antMatchers(HttpMethod.POST, "/search")
		        .permitAll()
		        .and()
			.authorizeRequests().anyRequest()
			.authenticated();
		http.formLogin().permitAll().and().logout().permitAll();
		http.csrf().disable();
	}

	@Override
	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
			throws Exception {
		authManagerBuilder.ldapAuthentication()
				.userDnPatterns("uid={0},ou=people", "uid={0},ou=apps")
				.groupSearchBase("ou=groups")
				.contextSource()
				.ldif("classpath:samplestack-ds.ldif")
				.root("dc=samplestack,dc=org");
	}

}