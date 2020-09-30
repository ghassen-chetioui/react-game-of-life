import produce from "immer";
import React, { useEffect, useState } from "react";
import "./App.css";

type Grid = { alive: boolean }[][];

function creatGrid(rows: number = 42, columns: number = 42) {
  const grid: Grid = [];
  for (let index = 0; index < rows; index++) {
    grid[index] = Array(columns).fill({ alive: false });
  }
  return grid;
}

const initialState = {
  started: false,
  grid: creatGrid(),
};
const vectors = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
];

function countAliveNeighbours(current: Grid, rowIndex: number, columnIndex: number) {
  let aliveNeighbours = 0;
  for (const vector of vectors) {
    const r = rowIndex + vector[0];
    const c = columnIndex + vector[1];
    if (r >= 0 && r < 42 && c >= 0 && c < 42 && current[r][c].alive) {
      aliveNeighbours++;
    }
  }
  return aliveNeighbours;
}

function computeNextGeneration(current: Grid, draft: Grid) {
  for (let rowIndex = 0; rowIndex < current.length; rowIndex++) {
    for (let columnIndex = 0; columnIndex < current[rowIndex].length; columnIndex++) {
      const aliveNeighbours = countAliveNeighbours(current, rowIndex, columnIndex);
      if (draft[rowIndex][columnIndex].alive) {
        if (aliveNeighbours < 2 || aliveNeighbours > 3) {
          draft[rowIndex][columnIndex].alive = false;
        }
      } else if (aliveNeighbours === 3) {
        draft[rowIndex][columnIndex].alive = true;
      }
    }
  }
}

function App() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let intervalID: any;
    if (state.started) {
      intervalID = setInterval(() => setState((prev) => produce(prev, (draft) => computeNextGeneration(prev.grid, draft.grid))), 300);
    }
    return () => {
      if (intervalID) clearInterval(intervalID);
    };
  }, [state.started]);

  function onCellClick(row: number, column: number) {
    if (state.started) return;

    const updatedState = produce(state, (draft) => {
      draft.grid[row][column].alive = !draft.grid[row][column].alive;
    });

    setState(updatedState);
  }

  function onButtonClick() {
    setState((state) => ({ ...state, started: !state.started }));
  }

  return (
    <main>
      <div className="grid">
        {state.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, cellIndex) => (
              <Cell key={`${rowIndex}-${cellIndex}`} alive={cell.alive} row={rowIndex} column={cellIndex} onClick={onCellClick} />
            ))}
          </div>
        ))}
      </div>
      <button onClick={onButtonClick}>{state.started ? "Stop" : "Start"}</button>
      <button onClick={() => setState(initialState)}>Clear all</button>
    </main>
  );
}

function Cell({ alive, row, column, onClick }: { alive: boolean; row: number; column: number; onClick: (row: number, column: number) => void }) {
  return <div className={`cell ${alive ? "alive" : ""}`} onClick={() => onClick(row, column)}></div>;
}

export default App;
