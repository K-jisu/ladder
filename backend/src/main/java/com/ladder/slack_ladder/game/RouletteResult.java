package com.ladder.slack_ladder.game;

import java.util.List;

/**
 * 룰렛 한 판의 결과.
 *
 * @param items       룰렛 항목 목록(휠의 조각 순서)
 * @param winnerIndex 당첨된 항목의 인덱스
 */
public record RouletteResult(List<String> items, int winnerIndex) {

    /** 당첨 항목 문자열. */
    public String winner() {
        return items.get(winnerIndex);
    }
}
