package com.app.bideo.service.message;

import com.app.bideo.dto.message.ChatRelayMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatRelayListener {

    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = "#{chatQueue.name}")
    public void onRelay(ChatRelayMessage relay) {
        if (relay == null || relay.getDestination() == null) return;
        messagingTemplate.convertAndSend(relay.getDestination(), relay.getPayload());
    }
}
