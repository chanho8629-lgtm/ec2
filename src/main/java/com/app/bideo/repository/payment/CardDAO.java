package com.app.bideo.repository.payment;

import com.app.bideo.domain.payment.CardVO;
import com.app.bideo.dto.payment.CardResponseDTO;
import com.app.bideo.mapper.payment.CardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CardDAO {

    private final CardMapper cardMapper;

    public List<CardResponseDTO> findByMemberId(Long memberId) {
        return cardMapper.selectByMemberId(memberId);
    }

    public Optional<CardResponseDTO> findById(Long cardId, Long memberId) {
        return Optional.ofNullable(cardMapper.selectById(cardId, memberId));
    }

    public int countActiveByMemberId(Long memberId) {
        return cardMapper.countActiveByMemberId(memberId);
    }

    public void save(CardVO cardVO) {
        cardMapper.insert(cardVO);
    }

    public void update(CardVO cardVO) {
        cardMapper.update(cardVO);
    }

    public void clearDefault(Long memberId) {
        cardMapper.clearDefault(memberId);
    }

    public void markDefault(Long cardId, Long memberId) {
        cardMapper.markDefault(cardId, memberId);
    }

    public void delete(Long cardId, Long memberId) {
        cardMapper.softDelete(cardId, memberId);
    }

    public Optional<CardResponseDTO> findLatestActiveCard(Long memberId) {
        return Optional.ofNullable(cardMapper.selectLatestActiveCard(memberId));
    }
}
