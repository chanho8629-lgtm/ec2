package com.app.bideo.dto.admin;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminRestrictionSearchDTO extends PageRequestDTO {
    private String keyword;
    private String restrictionType;
    private String status;
}
