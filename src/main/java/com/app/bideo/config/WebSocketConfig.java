package com.app.bideo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${spring.rabbitmq.host:127.0.0.1}")
    private String relayHost;

    @Value("${spring.rabbitmq.stomp-port:61613}")
    private int relayPort;

    @Value("${spring.rabbitmq.username:guest}")
    private String relayLogin;

    @Value("${spring.rabbitmq.password:guest}")
    private String relayPasscode;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableStompBrokerRelay("/topic")
              .setRelayHost(relayHost)
              .setRelayPort(relayPort)
              .setClientLogin(relayLogin)
              .setClientPasscode(relayPasscode)
              .setSystemLogin(relayLogin)
              .setSystemPasscode(relayPasscode)
              .setSystemHeartbeatSendInterval(10000)
              .setSystemHeartbeatReceiveInterval(10000);
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
