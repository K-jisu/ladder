package com.ladder.slack_ladder.game;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LadderServiceTest {

    private final LadderService service = new LadderService(new LadderGenerator(new Random(7)));

    @Test
    void 매핑은_항상_일대일_순열이다() {
        List<String> participants = List.of("철수", "영희", "민준", "지아", "수빈");
        List<String> results = List.of("1", "2", "3", "4", "5");

        // 시드 난수가 매 판 다른 배치를 만들므로 여러 판을 검증한다.
        for (int trial = 0; trial < 100; trial++) {
            LadderResult result = service.play(participants, results);

            Set<Integer> destinations = new HashSet<>(result.mapping().values());
            assertEquals(participants.size(), destinations.size(),
                    "각 결과는 정확히 한 명에게만 매핑되어야 한다");
            for (int dest : destinations) {
                assertTrue(dest >= 0 && dest < participants.size());
            }
        }
    }

    @Test
    void resultFor는_매핑된_결과_문자열을_돌려준다() {
        LadderResult result = service.play(
                List.of("a", "b", "c"),
                List.of("X", "Y", "Z"));

        for (int i = 0; i < 3; i++) {
            int dest = result.mapping().get(i);
            assertEquals(result.results().get(dest), result.resultFor(i));
        }
    }

    @Test
    void 참가자와_결과_수가_다르면_예외() {
        assertThrows(IllegalArgumentException.class,
                () -> service.play(List.of("a", "b"), List.of("X")));
    }

    @Test
    void 참가자가_2명_미만이면_예외() {
        assertThrows(IllegalArgumentException.class,
                () -> service.play(List.of("a"), List.of("X")));
    }
}
