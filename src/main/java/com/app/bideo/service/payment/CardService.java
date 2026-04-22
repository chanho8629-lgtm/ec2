package com.app.bideo.service.payment;

import com.app.bideo.domain.payment.CardVO;
import com.app.bideo.dto.payment.CardRegisterRequestDTO;
import com.app.bideo.dto.payment.CardResponseDTO;
import com.app.bideo.repository.payment.CardDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class CardService {

    private final CardDAO cardDAO;

    // 카드 목록 조회
    @Transactional(readOnly = true)
    @Cacheable(value = "cards", key = "#memberId")
    public List<CardResponseDTO> getMyCards(Long memberId) {
        return cardDAO.findByMemberId(memberId);
    }

    // 카드 상세 조회
    @Transactional(readOnly = true)
    @Cacheable(value = "card", key = "#memberId + ':' + #cardId")
    public CardResponseDTO getCard(Long memberId, Long cardId) {
        return cardDAO.findById(cardId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("카드를 찾을 수 없습니다."));
    }

    // 카드 등록
    @CacheEvict(value = {"cards", "card", "dashboard"}, allEntries = true)
    public CardResponseDTO register(Long memberId, CardRegisterRequestDTO requestDTO) {
        validateCardRequest(requestDTO);

        boolean makeDefault = Boolean.TRUE.equals(requestDTO.getIsDefault())
                || cardDAO.countActiveByMemberId(memberId) == 0;
        if (makeDefault) {
            cardDAO.clearDefault(memberId);
        }

        CardVO cardVO = CardVO.builder()
                .memberId(memberId)
                .cardCompany(requestDTO.getCardCompany().trim())
                .cardNumberMasked(requestDTO.getCardNumberMasked().trim())
                .billingKey(blankToNull(requestDTO.getBillingKey()))
                .isDefault(makeDefault)
                .build();
        cardDAO.save(cardVO);

        return getCard(memberId, cardVO.getId());
    }

    // 카드 수정
    @CacheEvict(value = {"cards", "card", "dashboard"}, allEntries = true)
    public CardResponseDTO update(Long memberId, Long cardId, CardRegisterRequestDTO requestDTO) {
        CardResponseDTO existingCard = getCard(memberId, cardId);
        validateCardRequest(requestDTO);

        boolean makeDefault = Boolean.TRUE.equals(requestDTO.getIsDefault()) || Boolean.TRUE.equals(existingCard.getIsDefault());
        if (Boolean.TRUE.equals(requestDTO.getIsDefault())) {
            cardDAO.clearDefault(memberId);
        }

        String billingKey = blankToNull(requestDTO.getBillingKey());
        if (billingKey == null) {
            billingKey = existingCard.getBillingKey();
        }

        cardDAO.update(CardVO.builder()
                .id(cardId)
                .memberId(memberId)
                .cardCompany(requestDTO.getCardCompany().trim())
                .cardNumberMasked(requestDTO.getCardNumberMasked().trim())
                .billingKey(billingKey)
                .isDefault(makeDefault)
                .build());

        return getCard(memberId, cardId);
    }

    // 카드 삭제
    @CacheEvict(value = {"cards", "card", "dashboard"}, allEntries = true)
    public void delete(Long memberId, Long cardId) {
        CardResponseDTO targetCard = getCard(memberId, cardId);
        cardDAO.delete(cardId, memberId);

        if (Boolean.TRUE.equals(targetCard.getIsDefault())) {
            cardDAO.findLatestActiveCard(memberId)
                    .ifPresent(card -> {
                        cardDAO.clearDefault(memberId);
                        cardDAO.markDefault(card.getId(), memberId);
                    });
        }
    }

    // 대표 카드 수정
    @CacheEvict(value = {"cards", "card", "dashboard"}, allEntries = true)
    public CardResponseDTO makeDefault(Long memberId, Long cardId) {
        getCard(memberId, cardId);
        cardDAO.clearDefault(memberId);
        cardDAO.markDefault(cardId, memberId);
        return getCard(memberId, cardId);
    }

    // 카드 입력값 검증
    private void validateCardRequest(CardRegisterRequestDTO requestDTO) {
        if (requestDTO.getCardCompany() == null || requestDTO.getCardCompany().trim().isBlank()) {
            throw new IllegalArgumentException("카드사를 입력해 주세요.");
        }
        if (requestDTO.getCardNumberMasked() == null || requestDTO.getCardNumberMasked().trim().isBlank()) {
            throw new IllegalArgumentException("카드 번호를 입력해 주세요.");
        }
    }

    // 공백 문자열 정리
    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
