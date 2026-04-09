package com.app.bideo.mapper.member;

import com.app.bideo.common.pagination.Criteria;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.member.MemberBadgeResponseDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface MemberMapper {
    // 회원 등록
    void insert(MemberVO memberVO);

    // 회원 조회
    Optional<MemberVO> selectById(Long id);

    // 이메일 회원 조회
    Optional<MemberVO> selectByEmail(String email);

    // 닉네임 회원 조회
    Optional<MemberVO> selectByNickname(String nickname); // 이승민| 프로필 닉네임 경로 조회로 인한 추가

    // 전화번호 회원 조회
    Optional<MemberVO> selectByPhoneNumber(String phoneNumber);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 마지막 로그인 수정
    void updateLastLogin(Long memberId);

    // 비밀번호 수정
    void updatePassword(@Param("memberId") Long memberId, @Param("password") String password);

    // 프로필 정보 수정
    void updateProfile(@Param("memberId") Long memberId,
                       @Param("nickname") String nickname,
                       @Param("realName") String realName,
                       @Param("bio") String bio,
                       @Param("profileImage") String profileImage,
                       @Param("phoneNumber") String phoneNumber);

    // 공개 작품 수 조회
    int countActiveWorksByMemberId(@Param("memberId") Long memberId);

    // 보유 뱃지 조회
    List<MemberBadgeResponseDTO> findOwnedBadgesByMemberId(@Param("memberId") Long memberId);

    // 대표 뱃지 조회
    List<MemberBadgeResponseDTO> findDisplayedBadgesByMemberId(@Param("memberId") Long memberId);

    // 대표 뱃지 초기화
    void clearDisplayedBadges(@Param("memberId") Long memberId);

    // 대표 뱃지 등록
    void displayBadges(@Param("memberId") Long memberId,
                       @Param("badgeIds") List<Long> badgeIds);

    // 공유 대상 조회
    List<MemberListResponseDTO> searchByKeyword(@Param("keyword") String keyword,
                                                @Param("currentMemberId") Long currentMemberId,
                                                @Param("limit") int limit);

    List<MemberListResponseDTO> searchByKeywordPaged(@Param("criteria") Criteria criteria,
                                                      @Param("keyword") String keyword,
                                                      @Param("currentMemberId") Long currentMemberId);
}
