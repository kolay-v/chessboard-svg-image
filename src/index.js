/* eslint-disable id-length, id-match */

const fs = require('fs')
const express = require('express')
const { StaticCanvas, loadSVGFromString, util: { groupSVGElements } } = require('fabric').fabric
const { Board } = require('chess/dist/board')

const {
  FILES,
  BG_COLOR,
  BOARD_SIZE,
  MARKS_SIZE,
  TEXT_COLOR,
  CROSS_COLOR,
  MARKS_COLOR,
  SQUARE_SIZE,
  B_CELL_COLOR,
  W_CELL_COLOR,
  BOARD_PADDING,
} = require('./config')

const {
  makeDot,
  makeCross,
  makePiece,
  makeScale,
  makeSquare,
} = require('./svg')

const app = express()
const stubSvg = fs.readFileSync('stubs/stub.svg', { encoding: 'utf-8' })

const renderSVG = (board, {
  marks = [],
  bgColor,
  marksSize,
  textColor,
  crossColor,
  marksColor,
  bCellColor,
  wCellColor,
  squareSize,
  whiteBottom,
  boardPadding,
}) => {
  const svgElements = []

  for (let i = 0; i < board.squares.length; i += 1) {
    const { file, rank, piece } = board.squares[i]
    const fileNumber = FILES.indexOf(file) + 1
    const x = ((whiteBottom ? 9 - fileNumber : fileNumber) - 1) * squareSize + boardPadding
    const y = ((whiteBottom ? rank : 9 - rank) - 1) * squareSize + boardPadding
    const color = (fileNumber + rank) % 2 ? wCellColor : bCellColor
    const squareId = `${file}${rank}`

    svgElements.push(makeSquare({ x, y, squareSize, squareId, color }))

    if (piece) {
      svgElements.push(makePiece({ x, y, piece }))
    }

    if (marks.includes(squareId)) {
      svgElements.push(
        piece
          ? makeCross({ x, y, crossColor })
          : makeDot({ x, y, squareSize, marksSize, marksColor }),
      )
    }
  }

  const horizontal = FILES.split('')
  const vertical = Array.from({ length: 8 }, (item, idx) => 8 - idx)

  for (let i = 0; i < 8; i += 1) {
    const file = horizontal[whiteBottom ? 8 - i - 1 : i]
    const rank = vertical[whiteBottom ? 8 - i - 1 : i]

    svgElements.push(makeScale({
      i,
      file,
      rank,
      boardPadding,
      squareSize,
      textColor,
    }))
  }
  const fileTail = 6
  const rankTail = 6
  const fileHead = 3
  const rankHead = 3
  const xTail = (fileTail + 0.5) * squareSize + boardPadding
  const yTail = (7.5 - rankTail) * squareSize + boardPadding
  const xHead = (fileHead + 0.5) * squareSize + boardPadding
  const yHead = (7.5 - rankHead) * squareSize + boardPadding
  const dx = xHead - xTail
  const dy = yHead - yTail
  const hypot = Math.hypot(dx, dy)


  const shaftX = xHead - dx * (squareSize * 0.1 + squareSize * 0.75) / hypot
  const shaftY = yHead - dy * (squareSize * 0.1 + squareSize * 0.75) / hypot

  const tipX = xHead - dx *squareSize * 0.1 / hypot
  const tipY = yHead - dy *squareSize * 0.1 / hypot

  svgElements.push(`<line x1="${xTail}" y1="${yTail}" x2="${shaftX}" y2="${shaftY}" stroke-width="${squareSize * 0.2}" stroke="#00FF00"></line>`)

  const marker = [[tipX, tipY],
    [shaftX + dy * 0.5 * squareSize * 0.75 / hypot,
    shaftY - dx * 0.5 * squareSize * 0.75 / hypot],
    [shaftX - dy * 0.5 * squareSize * 0.75 / hypot,
    shaftY + dx * 0.5 * squareSize * 0.75 / hypot]]
  svgElements.push(`<polygon points="${marker.map(([x, y]) => `${x},${y}`).join(' ')}" fill="#00FF00"></polygon>`)

  return stubSvg.split('{{bg}}').join(bgColor)
    .split('{{board}}').join(svgElements.join(''))
}

app.get('/:fen.jpeg', (req, res) => {
  console.time('gen time')
  const {
    rotate = 0,
    marks: marksList = '',
    bg_color: bgColor = BG_COLOR,
    board_size: boardSize = BOARD_SIZE,
    marks_size: marksSize = MARKS_SIZE,
    text_color: textColor = TEXT_COLOR,
    cross_color: crossColor = CROSS_COLOR,
    marks_color: marksColor = MARKS_COLOR,
    square_size: squareSize = SQUARE_SIZE,
    b_cell_color: bCellColor = B_CELL_COLOR,
    w_cell_color: wCellColor = W_CELL_COLOR,
    board_padding: boardPadding = BOARD_PADDING,
  } = req.query
  const { fen = 'rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBKQBNR' } = req.params

  const marks = marksList.split(',')
  const whiteBottom = !!Number(rotate)

  res.contentType('image/jpeg')

  const svg = renderSVG(Board.load(fen), {
    marks,
    bgColor,
    marksSize,
    textColor,
    crossColor,
    marksColor,
    squareSize,
    bCellColor,
    wCellColor,
    whiteBottom,
    boardPadding,
  })

  const canvas = new StaticCanvas('c', {
    width: boardSize,
    height: boardSize,
  })

  loadSVGFromString(svg, (objects, info) => {
    const ctx = canvas.getContext('2d')
    const scaleX = info.width ? (boardSize / info.width) : 1
    const scaleY = info.height ? (boardSize / info.height) : 1

    ctx.scale(scaleX, scaleY)

    const obj = groupSVGElements(objects, info)

    canvas.add(obj)
    canvas.renderAll()
    canvas.createJPEGStream().pipe(res)
    console.timeEnd('gen time')
  })
})

app.listen(3001)
