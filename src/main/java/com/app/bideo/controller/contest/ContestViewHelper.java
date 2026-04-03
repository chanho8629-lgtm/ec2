package com.app.bideo.controller.contest;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component("contestViewHelper")
public class ContestViewHelper {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    public String statusLabel(String status) {
        if (status == null || status.isBlank()) {
            return "-";
        }
        return switch (status) {
            case "UPCOMING" -> "예정";
            case "OPEN" -> "접수중";
            case "CLOSED" -> "마감";
            case "RESULT" -> "결과발표";
            default -> status;
        };
    }

    public String formatDate(LocalDate date) {
        return date == null ? "-" : date.format(DATE_FORMATTER);
    }

    public String formatPeriod(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            return "-";
        }
        return formatDate(start) + " ~ " + formatDate(end);
    }
}
