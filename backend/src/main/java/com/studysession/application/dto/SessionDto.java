package com.studysession.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record SessionDto(
        String id,
        String fileName,
        LocalDateTime createdAt,
        List<QuestionDto> questions
) {}
