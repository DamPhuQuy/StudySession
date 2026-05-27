package com.studysession.application.usecase;

import com.studysession.application.dto.SessionDto;
import com.studysession.domain.repository.SessionRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class ListSessionsUseCase {

    private final SessionRepository sessionRepository;

    public ListSessionsUseCase(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public List<SessionDto> execute() {
        return sessionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(s -> new SessionDto(
                        s.getId(),
                        s.getFileName(),
                        s.getCreatedAt(),
                        Collections.emptyList() // Omit questions list for history list view
                ))
                .toList();
    }
}
