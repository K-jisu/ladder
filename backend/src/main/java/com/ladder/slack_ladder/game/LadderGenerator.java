package com.ladder.slack_ladder.game;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.random.RandomGenerator;

/**
 * 사다리의 다리 배치를 무작위로 생성하고, 특정 세로줄에서 출발했을 때의 경로를 추적한다.
 *
 * <p>프론트엔드(TS)의 {@code generateBridges}/{@code tracePath} 로직을 그대로 포팅한 것이다.
 * 같은 행에서 인접한 두 다리가 겹치지 않도록 보장하므로, 출발-도착 매핑은 항상 일대일(순열)이 된다.
 */
@Component
public class LadderGenerator {

    /** 사다리의 기본 행(가로 단) 수. */
    public static final int DEFAULT_ROWS = 8;

    /** 각 칸에 다리가 놓일 확률. */
    private static final double BRIDGE_PROBABILITY = 0.45;

    private final RandomGenerator random;

    public LadderGenerator() {
        this(new Random());
    }

    /** 결정적 테스트를 위해 시드가 고정된 난수원을 주입할 수 있다. */
    public LadderGenerator(RandomGenerator random) {
        this.random = random;
    }

    /**
     * 다리 배치를 생성한다. 같은 행에서 인접한 다리가 겹치지 않도록 한다.
     *
     * @param cols 세로줄(참가자) 수
     * @param rows 행 수
     */
    public List<Bridge> generateBridges(int cols, int rows) {
        List<Bridge> bridges = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            Set<Integer> used = new HashSet<>();
            for (int c = 0; c < cols - 1; c++) {
                if (!used.contains(c)
                        && !used.contains(c + 1)
                        && random.nextDouble() < BRIDGE_PROBABILITY) {
                    bridges.add(new Bridge(r, c));
                    used.add(c);
                    used.add(c + 1);
                }
            }
        }
        return bridges;
    }

    /**
     * {@code start} 세로줄에서 출발하여 사다리를 따라 내려간 경로를 반환한다.
     *
     * @return 길이 {@code rows + 1}의 배열. {@code path[r]}은 r번째 행 진입 시점의 세로줄 인덱스이며,
     * {@code path[rows]}가 최종 도착 세로줄이다.
     */
    public int[] tracePath(int start, List<Bridge> bridges, int rows) {
        int[] path = new int[rows + 1];
        int col = start;
        path[0] = col;
        for (int r = 0; r < rows; r++) {
            if (hasBridge(bridges, r, col)) {
                col++;
            } else if (hasBridge(bridges, r, col - 1)) {
                col--;
            }
            path[r + 1] = col;
        }
        return path;
    }

    private boolean hasBridge(List<Bridge> bridges, int row, int col) {
        for (Bridge b : bridges) {
            if (b.row() == row && b.col() == col) {
                return true;
            }
        }
        return false;
    }
}
