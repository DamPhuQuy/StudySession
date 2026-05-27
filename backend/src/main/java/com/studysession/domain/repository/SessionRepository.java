package com.studysession.domain.repository;

import com.studysession.domain.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, String> {
}
