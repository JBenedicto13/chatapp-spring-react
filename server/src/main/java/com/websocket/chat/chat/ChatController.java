package com.websocket.chat.chat;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(
        @Payload ChatMessage chatMessage
    ) {
        chatMessage.setDate_time_sent(new Date());
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(
        @Payload ChatMessage chatMessage,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        // Add username in websocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }

    @MessageMapping("/chat.sendPrivateMessage")
    public ChatMessage recMessage(@Payload ChatMessage chatMessage){
        simpMessagingTemplate.convertAndSendToUser(chatMessage.getReceiver(),"/private",chatMessage);
        System.out.println(chatMessage.toString());
        return chatMessage;
    }
}
