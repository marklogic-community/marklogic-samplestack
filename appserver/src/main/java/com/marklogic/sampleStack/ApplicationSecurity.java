package com.marklogic.sampleStack;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity
public class ApplicationSecurity extends WebSecurityConfigurerAdapter {

	@Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/home", "/foo/**", "/docs/**", "/tags/**").permitAll()
                .anyRequest().authenticated();
		http.formLogin()	
                .permitAll()
                .and()
            .logout()
                .permitAll();
        http       
            .csrf()
                .disable();
    }
	
//	@Override
//    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
//        auth
//            .inMemoryAuthentication()
//                .withUser("admin").password("admin").roles("USER");
//    }
	
	@Override
	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
			throws Exception {
		authManagerBuilder.ldapAuthentication()
				.userDnPatterns("uid={0},ou=people", "uid={0},ou=apps")
				.groupSearchBase("ou=groups").contextSource()
				.ldif("classpath:test-server.ldif")
				.root("dc=samplestack,dc=org")
				;
	}

}