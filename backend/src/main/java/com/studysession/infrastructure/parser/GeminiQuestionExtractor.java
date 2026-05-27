package com.studysession.infrastructure.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studysession.domain.model.Question;
import com.studysession.domain.repository.QuestionExtractor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@Primary
public class GeminiQuestionExtractor implements QuestionExtractor {

    private final String apiKey;
    private final RegexQuestionExtractor fallbackExtractor;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiQuestionExtractor(
            @Value("${gemini.api-key:}") String apiKey,
            RegexQuestionExtractor fallbackExtractor) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.fallbackExtractor = fallbackExtractor;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public List<Question> extract(String rawText) {
        if (apiKey.isEmpty() || apiKey.startsWith("${")) {
            System.out.println("Gemini API key is not configured. Falling back to local Regex parser.");
            return fallbackExtractor.extract(rawText);
        }

        try {
            System.out.println("Extracting questions using Gemini API...");
            String responseBody = callGeminiApi(rawText);
            List<Question> parsedQuestions = parseGeminiResponse(responseBody);
            
            if (parsedQuestions.isEmpty()) {
                System.out.println("Gemini returned empty questions. Trying local Regex parser as fallback.");
                return fallbackExtractor.extract(rawText);
            }
            
            System.out.println("Successfully extracted " + parsedQuestions.size() + " questions using Gemini API.");
            return parsedQuestions;
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage() + ". Falling back to local Regex parser.");
            e.printStackTrace();
            return fallbackExtractor.extract(rawText);
        }
    }

    private String callGeminiApi(String rawText) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        String prompt = "Parse the following raw text containing multiple-choice questions. Extract all questions. " +
                "Generate exactly 4 options starting with A., B., C., D. for each question. " +
                "Include the correctAnswer (must be one character representing the choice: A, B, C, or D) " +
                "and a detailed explanation in Vietnamese (if context allows or if you can explain the correct option). " +
                "Raw Text:\n\n" + rawText;

        Map<String, Object> requestPayload = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of(
                                "text", prompt
                        ))
                )),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "responseSchema", Map.of(
                                "type", "ARRAY",
                                "items", Map.of(
                                        "type", "OBJECT",
                                        "properties", Map.of(
                                                "content", Map.of("type", "STRING"),
                                                "choices", Map.of(
                                                        "type", "ARRAY",
                                                        "items", Map.of("type", "STRING")
                                                ),
                                                "correctAnswer", Map.of("type", "STRING"),
                                                "explanation", Map.of("type", "STRING")
                                        ),
                                        "required", List.of("content", "choices", "correctAnswer")
                                )
                        )
                )
        );

        String jsonPayload = objectMapper.writeValueAsString(requestPayload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .timeout(Duration.ofSeconds(20))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP error code: " + response.statusCode() + ", body: " + response.body());
        }

        return response.body();
    }

    private List<Question> parseGeminiResponse(String responseBody) throws Exception {
        List<Question> questions = new ArrayList<>();
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.size() == 0) {
            return questions;
        }

        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (!parts.isArray() || parts.size() == 0) {
            return questions;
        }

        String rawJsonText = parts.get(0).path("text").asText();
        rawJsonText = cleanJsonText(rawJsonText);

        JsonNode questionsArray = objectMapper.readTree(rawJsonText);
        if (questionsArray.isArray()) {
            for (JsonNode node : questionsArray) {
                Question q = new Question();
                q.setContent(node.path("content").asText().trim());

                List<String> choices = new ArrayList<>();
                JsonNode choicesNode = node.path("choices");
                if (choicesNode.isArray()) {
                    for (JsonNode choice : choicesNode) {
                        choices.add(choice.asText().trim());
                    }
                }
                q.setChoices(choices);

                String ans = node.path("correctAnswer").asText().trim().toUpperCase();
                if (ans.length() > 0) {
                    q.setCorrectAnswer(ans.substring(0, 1));
                } else {
                    q.setCorrectAnswer("A");
                }

                q.setExplanation(node.has("explanation") && !node.path("explanation").isNull() 
                        ? node.path("explanation").asText().trim() 
                        : null);

                questions.add(q);
            }
        }

        return questions;
    }

    private String cleanJsonText(String text) {
        if (text == null) return "";
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
        } else if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        return text.trim();
    }
}
