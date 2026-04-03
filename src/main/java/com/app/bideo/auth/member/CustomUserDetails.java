package com.app.bideo.auth.member;

import com.app.bideo.common.enumeration.MemberRole;
import com.app.bideo.common.enumeration.MemberStatus;
import com.app.bideo.domain.member.MemberVO;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
public class CustomUserDetails implements UserDetails {
    private final Long id;
    private final String email;
    private final String password;
    private final String nickname;
    private final MemberRole role;
    private final MemberStatus status;

    public CustomUserDetails(MemberVO memberVO) {
        this.id = memberVO.getId();
        this.email = memberVO.getEmail();
        this.password = memberVO.getPassword();
        this.nickname = memberVO.getNickname();
        this.role = memberVO.getRole();
        this.status = memberVO.getStatus();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role == null ? java.util.List.of() : role.getAuthorities();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == MemberStatus.ACTIVE;
    }
}
