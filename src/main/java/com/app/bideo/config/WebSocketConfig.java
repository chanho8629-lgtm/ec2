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

    @Value("${app.websocket.broker.relay.enabled:false}")
    private boolean brokerRelayEnabled;

    @Value("${app.websocket.broker.relay.host:localhost}")
    private String relayHost;

    @Value("${app.websocket.broker.relay.port:61613}")
    private int relayPort;

    @Value("${app.websocket.broker.relay.client-login:guest}")
    private String clientLogin;

    @Value("${app.websocket.broker.relay.client-passcode:guest}")
    private String clientPasscode;

    @Value("${app.websocket.broker.relay.system-login:guest}")
    private String systemLogin;

    @Value("${app.websocket.broker.relay.system-passcode:guest}")
    private String systemPasscode;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        if (brokerRelayEnabled) {
            config.enableStompBrokerRelay("/topic")
                    .setRelayHost(relayHost)
                    .setRelayPort(relayPort)
                    .setClientLogin(clientLogin)
                    .setClientPasscode(clientPasscode)
                    .setSystemLogin(systemLogin)
                    .setSystemPasscode(systemPasscode);
        } else {
            config.enableSimpleBroker("/topic");
        }
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
