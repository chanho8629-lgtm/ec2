package com.app.bideo.repository.member;

import com.app.bideo.domain.member.MemberVO;
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

    public void save(MemberVO memberVO) {
        memberMapper.insert(memberVO);
    }

    public Optional<MemberVO> findById(Long id) {
        return memberMapper.selectById(id);
    }

    public Optional<MemberVO> findByEmail(String email) {
        return memberMapper.selectByEmail(email);
    }

    public Optional<MemberVO> findByNickname(String nickname) { // 이승민| 프로필 닉네임 경로 조회로 인한 추가
        return memberMapper.selectByNickname(nickname);
    }

    public Optional<MemberVO> findByPhoneNumber(String phoneNumber) {
        return memberMapper.selectByPhoneNumber(phoneNumber);
    }

    public boolean existsByNickname(String nickname) {
        return memberMapper.existsByNickname(nickname);
    }

    public void updateLastLogin(Long memberId) {
        memberMapper.updateLastLogin(memberId);
    }

    public void updatePassword(Long memberId, String password) {
        memberMapper.updatePassword(memberId, password);
    }

    public List<MemberListResponseDTO> searchByKeyword(String keyword, Long currentMemberId, int limit) {
        return memberMapper.searchByKeyword(keyword, currentMemberId, limit);
    }
}
