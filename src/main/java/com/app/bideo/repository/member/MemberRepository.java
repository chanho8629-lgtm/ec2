package com.app.bideo.repository.member;

import com.app.bideo.common.pagination.Criteria;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.member.MemberBadgeResponseDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.mapper.member.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MemberRepository {
    private final MemberMapper memberMapper;

    // 회원 저장
    public void save(MemberVO memberVO) {
        memberMapper.insert(memberVO);
    }

    // 회원 조회
    public Optional<MemberVO> findById(Long id) {
        return memberMapper.selectById(id);
    }

    // 이메일 회원 조회
    public Optional<MemberVO> findByEmail(String email) {
        return memberMapper.selectByEmail(email);
    }

    // 닉네임 회원 조회
    public Optional<MemberVO> findByNickname(String nickname) { // 이승민| 프로필 닉네임 경로 조회로 인한 추가
        return memberMapper.selectByNickname(nickname);
    }

    // 전화번호 회원 조회
    public Optional<MemberVO> findByPhoneNumber(String phoneNumber) {
        return memberMapper.selectByPhoneNumber(phoneNumber);
    }

    // 닉네임 중복 확인
    public boolean existsByNickname(String nickname) {
        return memberMapper.existsByNickname(nickname);
    }

    // 마지막 로그인 수정
    public void updateLastLogin(Long memberId) {
        memberMapper.updateLastLogin(memberId);
    }

    // 비밀번호 수정
    public void updatePassword(Long memberId, String password) {
        memberMapper.updatePassword(memberId, password);
    }

    // 프로필 정보 수정
    public void updateProfile(Long memberId, String nickname, String realName, String bio, String profileImage, String phoneNumber) {
        memberMapper.updateProfile(memberId, nickname, realName, bio, profileImage, phoneNumber);
    }

    // 공개 작품 수 조회
    public int countActiveWorksByMemberId(Long memberId) {
        return memberMapper.countActiveWorksByMemberId(memberId);
    }

    // 보유 뱃지 조회
    public List<MemberBadgeResponseDTO> findOwnedBadgesByMemberId(Long memberId) {
        return memberMapper.findOwnedBadgesByMemberId(memberId);
    }

    // 대표 뱃지 조회
    public List<MemberBadgeResponseDTO> findDisplayedBadgesByMemberId(Long memberId) {
        return memberMapper.findDisplayedBadgesByMemberId(memberId);
    }

    // 대표 뱃지 초기화
    public void clearDisplayedBadges(Long memberId) {
        memberMapper.clearDisplayedBadges(memberId);
    }

    // 대표 뱃지 등록
    public void displayBadges(Long memberId, List<Long> badgeIds) {
        memberMapper.displayBadges(memberId, badgeIds);
    }

    // 공유 대상 조회
    public List<MemberListResponseDTO> searchByKeyword(String keyword, Long currentMemberId, int limit) {
        return memberMapper.searchByKeyword(keyword, currentMemberId, limit);
    }

    public List<MemberListResponseDTO> searchByKeywordPaged(Criteria criteria, String keyword, Long currentMemberId) {
        return memberMapper.searchByKeywordPaged(criteria, keyword, currentMemberId);
    }
}
