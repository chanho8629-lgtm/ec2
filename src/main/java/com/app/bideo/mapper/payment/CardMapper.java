package com.app.bideo.mapper.payment;

import com.app.bideo.domain.payment.CardVO;
import com.app.bideo.dto.payment.CardResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CardMapper {

    // 카드 목록 조회
    List<CardResponseDTO> selectByMemberId(@Param("memberId") Long memberId);

    // 카드 상세 조회
    CardResponseDTO selectById(@Param("cardId") Long cardId, @Param("memberId") Long memberId);

    // 등록 카드 수 조회
    int countActiveByMemberId(@Param("memberId") Long memberId);

    // 카드 등록
    void insert(CardVO cardVO);

    // 카드 수정
    void update(CardVO cardVO);

    // 대표 카드 초기화
    void clearDefault(@Param("memberId") Long memberId);

    // 대표 카드 등록
    void markDefault(@Param("cardId") Long cardId, @Param("memberId") Long memberId);

    // 카드 삭제
    void softDelete(@Param("cardId") Long cardId, @Param("memberId") Long memberId);

    // 최근 카드 조회
    CardResponseDTO selectLatestActiveCard(@Param("memberId") Long memberId);
}
