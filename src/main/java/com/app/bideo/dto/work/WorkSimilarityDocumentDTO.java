package com.app.bideo.dto.work;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkSimilarityDocumentDTO {
    private Long id;
    private String title;
    private String category;
    private String description;
    private String tagText;

    public List<String> getTags() {
        if (tagText == null || tagText.isBlank()) return List.of();
        return List.of(tagText.split("\\s*\\|\\s*")).stream()
                .filter(t -> t != null && !t.isBlank())
                .toList();
    }
}
