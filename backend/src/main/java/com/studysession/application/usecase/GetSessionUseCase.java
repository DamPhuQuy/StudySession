package com.studysession.application.usecase;

import com.studysession.application.dto.QuestionDto;
import com.studysession.application.dto.SessionDto;
import com.studysession.domain.model.Session;
import com.studysession.domain.repository.SessionRepository;
import org.springframework.stereotype.Service;

@Service
public class GetSessionUseCase {

    private final SessionRepository sessionRepository;

    public GetSessionUseCase(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public SessionDto execute(String sessionId) {
        Session s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
        return new SessionDto(s.getId(), s.getFileName(), s.getCreatedAt(),
                s.getQuestions().stream()
                        .map(q -> new QuestionDto(q.getId(), q.getQuestionNumber(), q.getContent(),
                                q.getChoices(), q.getCorrectAnswer(), q.getExplanation()))
                        .toList());
    }
}
