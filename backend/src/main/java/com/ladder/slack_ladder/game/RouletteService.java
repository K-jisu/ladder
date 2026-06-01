package com.ladder.slack_ladder.game;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.random.RandomGenerator;

/**
 * 룰렛 항목 목록을 받아 당첨자를 무작위로 선택한다.
 *
 * <p>프론트엔드에서 {@code es-toolkit}의 {@code randomInt}로 하던 당첨자 선택을 서버로 옮긴 것이다.
 */
@Service
public class RouletteService {

    private final RandomGenerator random;

    public RouletteService() {
        this(new Random());
    }

    /** 결정적 테스트를 위해 시드가 고정된 난수원을 주입할 수 있다. */
    public RouletteService(RandomGenerator random) {
        this.random = random;
    }

    /**
     * 룰렛을 돌려 당첨 항목을 선택한다.
     *
     * @param items 룰렛 항목 목록(최소 2개)
     */
    public RouletteResult play(List<String> items) {
        if (items == null || items.size() < 2) {
            throw new IllegalArgumentException("룰렛 항목은 최소 2개여야 합니다.");
        }
        int winner = random.nextInt(items.size());
        return new RouletteResult(List.copyOf(items), winner);
    }
}
