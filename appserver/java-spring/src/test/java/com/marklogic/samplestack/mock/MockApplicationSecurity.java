package com.marklogic.samplestack.mock;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.web.SamplestackAuthenticationSuccessHandler;
import com.marklogic.samplestack.web.RestAuthenticationEntryPoint;


@EnableWebSecurity
@Component
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class MockApplicationSecurity extends WebSecurityConfigurerAdapter {

	@Autowired
	private SamplestackAuthenticationSuccessHandler successHandler;

	@Bean
	public SimpleUrlAuthenticationFailureHandler failureHandler() {
		return new SimpleUrlAuthenticationFailureHandler();
	};
	
	@Autowired
	private SimpleUrlAuthenticationFailureHandler failureHandler;

	@Autowired
	private RestAuthenticationEntryPoint entryPoint;
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests()
				.antMatchers(HttpMethod.GET, "/session", "/questions", "/tags")
				.permitAll().and().authorizeRequests()
				.antMatchers(HttpMethod.POST, "/search").permitAll().and()
				.authorizeRequests().anyRequest().authenticated();
		http.formLogin()
		        .failureHandler(failureHandler)
				.successHandler(successHandler)
				.permitAll().and().logout().permitAll();
		http.csrf().disable();
		http.exceptionHandling().authenticationEntryPoint(entryPoint);

	}



	@Override
	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
			throws Exception {

		 authManagerBuilder.inMemoryAuthentication()
         .withUser("joeUser@marklogic.com").password("joesPassword").roles("CONTRIBUTORS").and()
         .withUser("maryAdmin@marklogic.com").password("marysPassword").roles("CONTRIBUTORS", "ADMINS");

	}
	
}