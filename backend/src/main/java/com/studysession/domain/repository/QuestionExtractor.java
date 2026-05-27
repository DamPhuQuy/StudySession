package com.studysession.domain.repository;

import com.studysession.domain.model.Question;
import java.util.List;

public interface QuestionExtractor {
    List<Question> extract(String rawText);
}
