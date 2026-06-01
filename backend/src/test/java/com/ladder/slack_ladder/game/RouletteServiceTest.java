package com.ladder.slack_ladder.game;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RouletteServiceTest {

    @Test
    void 당첨_인덱스는_항목_범위_안에_있다() {
        RouletteService service = new RouletteService(new Random(3));
        List<String> items = List.of("커피", "점심", "청소", "꽝");

        for (int trial = 0; trial < 100; trial++) {
            RouletteResult result = service.play(items);
            assertTrue(result.winnerIndex() >= 0 && result.winnerIndex() < items.size());
            assertEquals(items.get(result.winnerIndex()), result.winner());
        }
    }

    @Test
    void 같은_시드는_같은_결과를_낸다() {
        List<String> items = List.of("a", "b", "c", "d", "e");

        RouletteResult first = new RouletteService(new Random(123)).play(items);
        RouletteResult second = new RouletteService(new Random(123)).play(items);

        assertEquals(first.winnerIndex(), second.winnerIndex());
    }

    @Test
    void 항목이_2개_미만이면_예외() {
        RouletteService service = new RouletteService();
        assertThrows(IllegalArgumentException.class, () -> service.play(List.of("혼자")));
        assertThrows(IllegalArgumentException.class, () -> service.play(List.of()));
    }
}
