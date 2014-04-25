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
//        http
//            .authorizeRequests()
//                .antMatchers("/foo", "/foo/2").permitAll()
//                .anyRequest().authenticated();
//        http
//            .formLogin()
//                .loginPage("/login")
//                .permitAll()
//                .and()
//            .logout()
//                .permitAll();
        http       
            .csrf()
                .disable();
    }
	
	@Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
            .inMemoryAuthentication()
                .withUser("admin").password("admin").roles("USER");
    }
	
	// TODO LDAP return to.
//	@Override
//	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
//			throws Exception {
//		authManagerBuilder.ldapAuthentication()
//				.userDnPatterns("uid={0},ou=people")
//				.groupSearchBase("ou=groups").contextSource()
//				.ldif("classpath:test-server.ldif");
//	}

}