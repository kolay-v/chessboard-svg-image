/* eslint-disable id-length, id-match */
require('dotenv').config()
const fs = require('fs')
const sharp = require('sharp')
const express = require('express')
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
  makeArrow,
  makeCross,
  makePiece,
  makeScale,
  makeSquare,
} = require('./svg')

const app = express()
const stubSvg = fs.readFileSync('stubs/stub.svg', { encoding: 'utf-8' })

const renderSVG = (board, {
  marks = [],
  arrows = [],
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

  if (arrows.length > 0) {
    for (let i = 0; i < arrows.length; i += 1) {
      const arrow = arrows[i].match(
        /(?<fromFile>[a-h])(?<fromRank>\d)(?<toFile>[a-h])(?<toRank>\d)(?<color>[0-9a-f]{3,8})?/,
      )
      console.log(makeArrow({ ...arrow.groups, squareSize, boardPadding }))
      svgElements.push(makeArrow({ ...arrow.groups, squareSize, boardPadding }))
    }
  }

  return stubSvg.split('{{bg}}').join(bgColor)
    .split('{{board}}').join(svgElements.join(''))
}

app.get('/:fen.jpeg', (req, res) => {
  // TODO: add Validation?
  const {
    rotate = 0,
    arrows = [],
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
  // TODO: default fen?
  const { fen } = req.params // = 'rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBKQBNR'

  const marks = marksList.split(',')
  const whiteBottom = !!Number(rotate)

  res.contentType('image/jpeg')
  let svg
  try {
    svg = renderSVG(Board.load(fen), {
      marks,
      arrows,
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
  } catch (error) {
    console.error('Error while svg generation', error)
    res.send('error')
    return
  }
  try {
    sharp(Buffer.from(svg))
      .resize(Number(boardSize))
      .jpeg()
      .pipe(res)
  } catch (error) {
    console.error('Error while svg rendering', error)
    res.send('error')
  }
})

app.listen(process.env.APP_PORT)
