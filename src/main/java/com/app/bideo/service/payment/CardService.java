package com.app.bideo.service.payment;

import com.app.bideo.domain.payment.CardVO;
import com.app.bideo.dto.payment.BootpayBillingCardResultDTO;
import com.app.bideo.dto.payment.CardRegisterRequestDTO;
import com.app.bideo.dto.payment.CardResponseDTO;
import com.app.bideo.repository.payment.CardDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class CardService {
    private static final Pattern DIGITS_ONLY = Pattern.compile("\\d+");

    private final CardDAO cardDAO;
    private final BootpayBillingService bootpayBillingService;

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
        CardRegistrationData registrationData = resolveCardRegistrationData(memberId, requestDTO, null);

        boolean makeDefault = Boolean.TRUE.equals(requestDTO.getIsDefault())
                || cardDAO.countActiveByMemberId(memberId) == 0;
        if (makeDefault) {
            cardDAO.clearDefault(memberId);
        }

        CardVO cardVO = CardVO.builder()
                .memberId(memberId)
                .cardCompany(registrationData.cardCompany())
                .cardNumberMasked(registrationData.cardNumberMasked())
                .billingKey(registrationData.billingKey())
                .billingReceiptId(registrationData.billingReceiptId())
                .billingMethod(registrationData.billingMethod())
                .billingStatus(registrationData.billingStatus())
                .isDefault(makeDefault)
                .build();
        cardDAO.save(cardVO);

        return getCard(memberId, cardVO.getId());
    }

    // 카드 수정
    @CacheEvict(value = {"cards", "card", "dashboard"}, allEntries = true)
    public CardResponseDTO update(Long memberId, Long cardId, CardRegisterRequestDTO requestDTO) {
        CardResponseDTO existingCard = getCard(memberId, cardId);
        CardRegistrationData registrationData = resolveCardRegistrationData(memberId, requestDTO, existingCard);

        boolean makeDefault = Boolean.TRUE.equals(requestDTO.getIsDefault()) || Boolean.TRUE.equals(existingCard.getIsDefault());
        if (Boolean.TRUE.equals(requestDTO.getIsDefault())) {
            cardDAO.clearDefault(memberId);
        }

        cardDAO.update(CardVO.builder()
                .id(cardId)
                .memberId(memberId)
                .cardCompany(registrationData.cardCompany())
                .cardNumberMasked(registrationData.cardNumberMasked())
                .billingKey(registrationData.billingKey())
                .billingReceiptId(registrationData.billingReceiptId())
                .billingMethod(registrationData.billingMethod())
                .billingStatus(registrationData.billingStatus())
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
    private CardRegistrationData resolveCardRegistrationData(Long memberId, CardRegisterRequestDTO requestDTO, CardResponseDTO existingCard) {
        if (requestDTO.getCardCompany() == null || requestDTO.getCardCompany().trim().isBlank()) {
            throw new IllegalArgumentException("카드사를 입력해 주세요.");
        }

        String cardNumber = digitsOnly(requestDTO.getCardNumber());
        String maskedNumber = blankToNull(requestDTO.getCardNumberMasked());
        String billingKey = blankToNull(requestDTO.getBillingKey());
        String billingReceiptId = existingCard == null ? null : existingCard.getBillingReceiptId();
        String billingMethod = existingCard == null ? null : existingCard.getBillingMethod();
        String billingStatus = existingCard == null ? null : existingCard.getBillingStatus();

        if (billingKey == null && existingCard != null) {
            billingKey = existingCard.getBillingKey();
        }

        if (maskedNumber == null && !cardNumber.isBlank()) {
            maskedNumber = maskCardNumber(cardNumber);
        }

        if (maskedNumber == null && existingCard != null) {
            maskedNumber = existingCard.getCardNumberMasked();
        }

        boolean hasSensitiveInput =
                !cardNumber.isBlank()
                        || !digitsOnly(requestDTO.getCardPasswordTwoDigits()).isBlank()
                        || !digitsOnly(requestDTO.getCardIdentityNo()).isBlank()
                        || !digitsOnly(requestDTO.getCardExpireMonth()).isBlank()
                        || !digitsOnly(requestDTO.getCardExpireYear()).isBlank();

        if (hasSensitiveInput) {
            validateSensitiveFields(cardNumber, requestDTO);
            // 변경: 입력된 카드 민감정보는 저장하지 않고 부트페이 빌링키 발급 결과만 남긴다.
            BootpayBillingCardResultDTO issuedCard = bootpayBillingService.issueBillingKey(memberId, requestDTO);
            billingKey = issuedCard.getBillingKey();
            billingReceiptId = issuedCard.getBillingReceiptId();
            billingMethod = issuedCard.getBillingMethod();
            billingStatus = issuedCard.getBillingStatus();
            maskedNumber = blankToNull(issuedCard.getCardNumberMasked()) != null
                    ? issuedCard.getCardNumberMasked()
                    : maskedNumber;
        }

        if (maskedNumber == null || maskedNumber.isBlank()) {
            throw new IllegalArgumentException("카드 번호를 입력해 주세요.");
        }

        if (billingKey == null || billingKey.isBlank()) {
            throw new IllegalArgumentException("카드 빌링키 발급에 실패했습니다.");
        }

        return new CardRegistrationData(
                requestDTO.getCardCompany().trim(),
                maskedNumber,
                billingKey,
                billingReceiptId,
                billingMethod,
                billingStatus
        );
    }

    private void validateSensitiveFields(String cardNumber, CardRegisterRequestDTO requestDTO) {
        if (cardNumber.length() < 12 || cardNumber.length() > 16 || !DIGITS_ONLY.matcher(cardNumber).matches()) {
            throw new IllegalArgumentException("카드 번호 형식이 올바르지 않습니다.");
        }

        String cardPasswordTwoDigits = digitsOnly(requestDTO.getCardPasswordTwoDigits());
        if (cardPasswordTwoDigits.length() != 2) {
            throw new IllegalArgumentException("카드 비밀번호 앞 2자리를 입력해 주세요.");
        }

        String cardIdentityNo = digitsOnly(requestDTO.getCardIdentityNo());
        if (cardIdentityNo.length() != 6) {
            throw new IllegalArgumentException("생년월일 6자리를 입력해 주세요.");
        }

        String expireMonth = digitsOnly(requestDTO.getCardExpireMonth());
        if (expireMonth.length() != 2) {
            throw new IllegalArgumentException("유효기간 월을 입력해 주세요.");
        }

        int month = Integer.parseInt(expireMonth);
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("유효기간 월은 01부터 12까지 입력할 수 있습니다.");
        }

        String expireYear = digitsOnly(requestDTO.getCardExpireYear());
        if (expireYear.length() != 2) {
            throw new IllegalArgumentException("유효기간 년을 입력해 주세요.");
        }
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber.length() < 8) {
            throw new IllegalArgumentException("카드 번호 형식이 올바르지 않습니다.");
        }

        return cardNumber.substring(0, 4) + " **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }

    private String digitsOnly(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D", "");
    }

    // 공백 문자열 정리
    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private record CardRegistrationData(
            String cardCompany,
            String cardNumberMasked,
            String billingKey,
            String billingReceiptId,
            String billingMethod,
            String billingStatus
    ) {
    }
}
