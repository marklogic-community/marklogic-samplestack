package com.marklogic.samplestack.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.web.security.SamplestackSecurityFilters;

@EnableWebSecurity
@Component
@EnableGlobalMethodSecurity(prePostEnabled = true)
/**
 * The Spring Security configuration for Samplestack.
 * Contains configuration for the web-tier security,
 * including the embedded LDAP backend configuration and the
 * user-facing method for securing the application's endpoints.
 */
public class ApplicationSecurity extends WebSecurityConfigurerAdapter {

	@Autowired
	private AuthenticationSuccessHandler successHandler;

	@Autowired
	private AuthenticationFailureHandler failureHandler;

	@Autowired
	private LogoutSuccessHandler logoutSuccessHandler;
	
	@Autowired
	private AuthenticationEntryPoint entryPoint;

	@Autowired
	private AccessDeniedHandler samplestackAccessDeniedHandler;
	

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.authorizeRequests()
				.antMatchers(HttpMethod.GET, "/session", "/questions/**", "/tags/**").permitAll()
			.and()
			.authorizeRequests()
				.antMatchers(HttpMethod.POST, "/search").permitAll()
			.and()
				.authorizeRequests().antMatchers("/questions/**", "/contributors/**")
				.authenticated()
			.and()
				.authorizeRequests().anyRequest().denyAll();
		http.formLogin()
		        .failureHandler(failureHandler)
				.successHandler(successHandler)
				.permitAll().and()
			.logout()
				.logoutSuccessHandler(logoutSuccessHandler)
				.permitAll();
		http.csrf().disable();
		http.exceptionHandling().authenticationEntryPoint(entryPoint)
		.accessDeniedHandler(samplestackAccessDeniedHandler);
		
	}

	@Override
	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
			throws Exception {

		authManagerBuilder.ldapAuthentication()

		.userDnPatterns("uid={0},ou=people", "uid={0},ou=apps")
				.groupSearchBase("ou=groups").contextSource()
				.ldif("classpath:samplestack-ds.ldif")
				.root("dc=samplestack,dc=org");

	}

}