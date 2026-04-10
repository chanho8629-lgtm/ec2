package com.app.bideo.controller.payment;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.payment.CardRegisterRequestDTO;
import com.app.bideo.dto.payment.CardResponseDTO;
import com.app.bideo.service.payment.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardAPIController {

    private final CardService cardService;

    @GetMapping
    public ResponseEntity<List<CardResponseDTO>> getMyCards(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(cardService.getMyCards(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardResponseDTO> getCard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(cardService.getCard(userDetails.getId(), id));
    }

    @PostMapping
    public ResponseEntity<CardResponseDTO> register(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CardRegisterRequestDTO requestDTO) {
        return ResponseEntity.ok(cardService.register(userDetails.getId(), requestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardResponseDTO> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody CardRegisterRequestDTO requestDTO) {
        return ResponseEntity.ok(cardService.update(userDetails.getId(), id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        cardService.delete(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<CardResponseDTO> makeDefault(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(cardService.makeDefault(userDetails.getId(), id));
    }
}
