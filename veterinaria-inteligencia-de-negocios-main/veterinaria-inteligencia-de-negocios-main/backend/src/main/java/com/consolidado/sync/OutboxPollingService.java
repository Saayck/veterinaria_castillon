package com.consolidado.sync;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OutboxPollingService {

    private final SyncService syncService;

    public OutboxPollingService(SyncService syncService) {
        this.syncService = syncService;
    }

    @Scheduled(fixedDelay = 5000)
    public void poll() {
        syncService.processMessages(10);
    }
}