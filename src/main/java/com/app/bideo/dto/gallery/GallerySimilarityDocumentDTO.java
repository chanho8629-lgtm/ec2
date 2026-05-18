package com.app.bideo.dto.gallery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GallerySimilarityDocumentDTO {
    private Long id;
    private String title;
    private String description;
    private String tagText;
    private String workText;

    public List<String> getTags() {
        return split(tagText);
    }

    public List<String> getWorks() {
        return split(workText);
    }

    private List<String> split(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return List.of(value.split("\\s*\\|\\s*")).stream()
                .filter(item -> item != null && !item.isBlank())
                .toList();
    }
}
