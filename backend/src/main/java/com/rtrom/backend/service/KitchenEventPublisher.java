package com.rtrom.backend.service;

import com.rtrom.backend.dto.response.KitchenTicketResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class KitchenEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(KitchenEventPublisher.class);
    private final SimpMessagingTemplate messagingTemplate;

    public KitchenEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Broadcasts a kitchen ticket update to all subscribers of /topic/kitchen/tickets.
     * Used whenever a ticket is created, or its status changes.
     */
    public void publishTicketUpdate(KitchenTicketResponse ticket) {
        log.info("Publishing kitchen ticket update for ticketId={}, status={}",
                ticket.getTicketId(), ticket.getKitchenStatus());
        runAfterCommit(() -> {
            try {
                messagingTemplate.convertAndSend("/topic/kitchen/tickets", ticket);
            } catch (Exception e) {
                log.error("Failed to publish kitchen ticket update via WebSocket: {}", e.getMessage());
            }
        });
    }

    public void publishTableOrderUpdate(Long tableId, KitchenTicketResponse ticket) {
        log.info("Publishing table order update for tableId={}", tableId);
        runAfterCommit(() -> {
            try {
                messagingTemplate.convertAndSend("/topic/table/" + tableId + "/orders", ticket);
            } catch (Exception e) {
                log.error("Failed to publish table order update via WebSocket for table {}: {}", tableId, e.getMessage());
            }
        });
    }

    public void publishGeneralUpdate(String entityType) {
        log.info("Publishing general update signal for: {}", entityType);
        runAfterCommit(() -> {
            try {
                messagingTemplate.convertAndSend("/topic/updates", entityType);
            } catch (Exception e) {
                log.error("Failed to publish general update signal: {}", e.getMessage());
            }
        });
    }

    private void runAfterCommit(Runnable task) {
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        task.run();
                    }
                }
            );
        } else {
            task.run();
        }
    }
}
