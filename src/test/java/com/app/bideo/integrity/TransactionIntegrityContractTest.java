package com.app.bideo.integrity;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class TransactionIntegrityContractTest {

    @Test
    void auctionBidUsesRowLockAndUniqueWinnerIndex() throws IOException {
        String mapper = read("src/main/resources/mapper/auction/AuctionMapper.xml");
        String migration = read("src/main/resources/sql/2026-06-19_payment_auction_integrity.sql");

        assertTrue(mapper.contains("FOR UPDATE"));
        assertTrue(migration.contains("ux_bid_one_winner_per_auction"));
        assertTrue(migration.contains("where is_winning = true"));
    }

    @Test
    void paymentReceiptIsPersistedAndUniquelyConstrained() throws IOException {
        String service = read("src/main/java/com/app/bideo/service/payment/PaymentService.java");
        String migration = read("src/main/resources/sql/2026-06-19_payment_auction_integrity.sql");

        assertTrue(service.contains("existsPgReceiptIdForOtherPayment"));
        assertTrue(service.contains("updatePgReceiptId(payment.getId(), requestDTO.getReceiptId())"));
        assertTrue(migration.contains("ux_payment_pg_receipt"));
    }

    private String read(String path) throws IOException {
        return Files.readString(Path.of(path), StandardCharsets.UTF_8);
    }
}
