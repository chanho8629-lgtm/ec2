package com.app.bideo.repository.member;

import com.app.bideo.common.enumeration.OAuthProvider;
import com.app.bideo.domain.member.OAuthLoginVO;
import com.app.bideo.mapper.member.OAuthLoginMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class OAuthLoginRepository {
    private final OAuthLoginMapper oAuthLoginMapper;

    public void save(OAuthLoginVO oAuthLoginVO) {
        oAuthLoginMapper.insert(oAuthLoginVO);
    }

    public Optional<OAuthLoginVO> findByProviderAndProviderId(OAuthProvider provider, String providerId) {
        return oAuthLoginMapper.selectByProviderAndProviderId(provider, providerId);
    }

    public Optional<OAuthLoginVO> findByMemberIdAndProvider(Long memberId, OAuthProvider provider) {
        return oAuthLoginMapper.selectByMemberIdAndProvider(memberId, provider);
    }
}
