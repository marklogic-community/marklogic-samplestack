package com.marklogic.samplestack.mock;

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
import org.springframework.stereotype.Component;


@EnableWebSecurity
@Component
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class MockApplicationSecurity extends WebSecurityConfigurerAdapter {

	@Autowired
	private AuthenticationSuccessHandler successHandler;

	@Autowired
	private AuthenticationFailureHandler failureHandler;

	@Autowired
	private AuthenticationEntryPoint entryPoint;
	
	@Autowired
	private AccessDeniedHandler samplestackAccessDeniedHandler;
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests()
				.antMatchers(HttpMethod.GET, "/questions/**", "/tags/**")
				.permitAll().and().authorizeRequests()
				.antMatchers(HttpMethod.POST, "/search").permitAll().and()
				.authorizeRequests().antMatchers("/questions/**", "/contributors/**").authenticated().and()
				.authorizeRequests().anyRequest().denyAll();
		http.formLogin()
		        .failureHandler(failureHandler)
				.successHandler(successHandler)
				.permitAll().and().logout().permitAll();
		http.exceptionHandling().authenticationEntryPoint(entryPoint)
		.accessDeniedHandler(samplestackAccessDeniedHandler);
		
	}



	@Override
	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
			throws Exception {

		 authManagerBuilder.inMemoryAuthentication()
         .withUser("joeUser@marklogic.com").password("joesPassword").roles("CONTRIBUTORS").and()
         .withUser("maryAdmin@marklogic.com").password("marysPassword").roles("CONTRIBUTORS", "ADMINS");

	}
	
}