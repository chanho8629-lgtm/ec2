package com.app.bideo.util;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;

public class DateUtils {
    public static String toRelativeTime(String date){
        if(date == null || date.isEmpty()){
            return "";
        }

        DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                .appendPattern("yyyy-MM-dd HH:mm:ss")
                .optionalStart()
                .appendFraction(ChronoField.MICRO_OF_SECOND, 0, 6, true)
                .optionalEnd()
                .toFormatter();
        LocalDateTime localDateTime = LocalDateTime.parse(date, formatter);
        LocalDateTime now = LocalDateTime.now();

        Duration duration = Duration.between(localDateTime, now);

        long seconds = duration.getSeconds();
        if(seconds < 60) {
            return "방금 전";
        }
        long minutes = seconds / 60;
        if(minutes < 60) {
            return minutes + "분 전";
        }
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + "시간 전";
        }

        long days = hours / 24;
        if (days < 30) {
            return days + "일 전";
        }

        long months = days / 30;
        if (months < 12) {
            return months + "개월 전";
        }

        long years = months / 12;
        return years + "년 전";
    }
}