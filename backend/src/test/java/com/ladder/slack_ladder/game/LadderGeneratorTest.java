package com.ladder.slack_ladder.game;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LadderGeneratorTest {

    @Test
    void 같은_행에서_다리는_겹치거나_인접하지_않는다() {
        LadderGenerator gen = new LadderGenerator(new Random(42));

        List<Bridge> bridges = gen.generateBridges(6, 8);

        Map<Integer, List<Integer>> colsByRow = new HashMap<>();
        for (Bridge b : bridges) {
            colsByRow.computeIfAbsent(b.row(), k -> new ArrayList<>()).add(b.col());
        }
        for (List<Integer> cols : colsByRow.values()) {
            Collections.sort(cols);
            for (int i = 1; i < cols.size(); i++) {
                // 다리는 col, col+1을 모두 점유하므로 다음 다리는 최소 2칸 떨어져야 한다.
                assertTrue(cols.get(i) - cols.get(i - 1) >= 2,
                        "같은 행의 다리가 인접/중복됨: " + cols);
            }
        }
    }

    @Test
    void 경로는_항상_사다리_범위_안에_머문다() {
        LadderGenerator gen = new LadderGenerator(new Random(1));
        int cols = 5;
        int rows = 8;
        List<Bridge> bridges = gen.generateBridges(cols, rows);

        for (int start = 0; start < cols; start++) {
            int[] path = gen.tracePath(start, bridges, rows);
            assertEquals(rows + 1, path.length);
            assertEquals(start, path[0]);
            for (int col : path) {
                assertTrue(col >= 0 && col < cols, "경로가 범위를 벗어남: " + col);
            }
        }
    }

    @Test
    void 다리가_없으면_경로는_직진한다() {
        LadderGenerator gen = new LadderGenerator(new Random());
        int rows = 8;

        int[] path = gen.tracePath(2, List.of(), rows);

        for (int col : path) {
            assertEquals(2, col);
        }
    }
}
