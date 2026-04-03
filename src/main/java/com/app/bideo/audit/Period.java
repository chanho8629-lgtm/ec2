package com.app.bideo.audit;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class Period {
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;
}
