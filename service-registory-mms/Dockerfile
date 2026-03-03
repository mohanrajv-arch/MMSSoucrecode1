FROM tomcat:10.1-jdk17
 
# Remove default apps
RUN rm -rf /usr/local/tomcat/webapps/*
 
# Copy WAR file into Tomcat
COPY build/libs/*.war /usr/local/tomcat/webapps/service-registry-scm.war
 
EXPOSE 8080
 
CMD ["catalina.sh", "run"]
