package com.studysession.infrastructure.parser;

import com.studysession.domain.model.Question;
import com.studysession.domain.repository.QuestionExtractor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class RegexQuestionExtractor implements QuestionExtractor {

    private static final Pattern QUESTION_PATTERN = Pattern.compile(
            "(?i)(?:Câu|Question)\\s*\\d+[.:]?\\s*(.+?)\\s*" +
            "(A[.)]\\s*.+?)\\s*" +
            "(B[.)]\\s*.+?)\\s*" +
            "(C[.)]\\s*.+?)\\s*" +
            "(D[.)]\\s*.+?)\\s*" +
            "(?:Đáp án|Answer)[:\\s]*([A-D])[.::)]?[^\\n]*" +
            "(?:\\s*(?:Giải thích|Explanation)[:\\s]*(.+?))?(?=\\s*(?:Câu|Question)\\s*\\d+|$)",
            Pattern.DOTALL
    );

    @Override
    public List<Question> extract(String rawText) {
        List<Question> questions = new ArrayList<>();
        if (rawText == null || rawText.isBlank()) {
            return questions;
        }
        
        Matcher matcher = QUESTION_PATTERN.matcher(rawText);
        while (matcher.find()) {
            Question q = new Question();
            q.setContent(matcher.group(1).trim());
            q.setChoices(List.of(
                    matcher.group(2).trim(),
                    matcher.group(3).trim(),
                    matcher.group(4).trim(),
                    matcher.group(5).trim()
            ));
            q.setCorrectAnswer(matcher.group(6).trim().toUpperCase());
            q.setExplanation(matcher.group(7) != null ? matcher.group(7).trim() : null);
            questions.add(q);
        }
        return questions;
    }
}
