package com.studysession.application.dto;

import java.util.List;

public record QuestionDto(
        Long id,
        int questionNumber,
        String content,
        List<String> choices,
        String correctAnswer,
        String explanation
) {}
