import { Fragment, useRef, useEffect } from "react";

import { getRelativeCoords } from "../functions";
import { Squares } from "./Squares";
import { useChessboard } from "../context/chessboard-context";
import { WhiteKing } from "./ErrorBoundary";
import { SelectPromotionDialog } from "./SelectPromotionDialog";
import { useAnimatedUnmount } from "../hooks/useAnimatedUnmount";

export function Board() {
  const boardRef = useRef<HTMLDivElement>(null);

  const {
    arrows,
    animationDuration,
    boardOrientation,
    boardWidth,
    clearCurrentRightClickDown,
    customArrowColor,
    promotion,
    setPromotionState,
  } = useChessboard();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boardRef.current && !boardRef.current.contains(event.target as Node)) {
        clearCurrentRightClickDown();
      }
    }

    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, []);

  const { showComponent: showPromotionDialog, style } = useAnimatedUnmount(
    promotion.isDialogOpen,
    animationDuration
  );

  return boardWidth ? (
    <div ref={boardRef} style={{ position: "relative" }}>
      <Squares />
      {/* cover board with semi-transparent div while choosing promotion piece */}
      {promotion.isDialogOpen && (
        <div
          onClick={(e) => {
            if (promotion.isDialogOpen) {
              setPromotionState({
                ...promotion,
                isDialogOpen: false,
                piece: undefined,
              });
            }
          }}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: "100",
            backgroundColor: "rgba(22,21,18,.7)",
            width: boardWidth,
            height: boardWidth,
          }}
        />
      )}
      <svg
        width={boardWidth}
        height={boardWidth}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          pointerEvents: "none",
          zIndex: "10",
        }}
      >
        {arrows.map((arrow) => {
          const from = getRelativeCoords(boardOrientation, boardWidth, arrow[0]);
          const to = getRelativeCoords(boardOrientation, boardWidth, arrow[1]);

          return (
            <Fragment key={`${arrow[0]}-${arrow[1]}`}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="2"
                  markerHeight="2.5"
                  refX="1.25"
                  refY="1.25"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 2 1.25, 0 2.5"
                    style={{ fill: customArrowColor }}
                  />
                </marker>
              </defs>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                style={{
                  stroke: customArrowColor,
                  strokeWidth: boardWidth / 36,
                }}
                markerEnd="url(#arrowhead)"
              />
            </Fragment>
          );
        })}
      </svg>
      {showPromotionDialog && (
        <SelectPromotionDialog
          handlePromotion={promotion.onPromotionSelect}
          style={style}
          dialogCoords={
            promotion.targetSquare &&
            getRelativeCoords(boardOrientation, boardWidth, promotion.targetSquare)
          }
        />
      )}
    </div>
  ) : (
    <WhiteKing />
  );
}
