package com.ladder.slack_ladder.game;

/**
 * 사다리의 가로 다리 하나. {@code col} 번 세로줄과 {@code col + 1} 번 세로줄을 잇는다.
 *
 * @param row 다리가 위치한 행(위에서부터 0-based)
 * @param col 다리가 잇는 두 세로줄 중 왼쪽 줄의 인덱스
 */
public record Bridge(int row, int col) {
}
