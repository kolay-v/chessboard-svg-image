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

const app = express()
const stubSvg = fs.readFileSync('stub.svg', { encoding: 'utf-8' })

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

    svgElements.push(`<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" class="square ${squareId}" stroke="none" fill="#${color}"/>`)

    if (piece) {
      svgElements.push(`<use xlink:href="#${piece.side.name}-${piece.type}" transform="translate(${x}, ${y})"/>`)
    }

    if (marks.includes(squareId)) {
      svgElements.push(piece
        ? `<g transform="translate(${x}, ${y})"><path d="M35.865 9.135a1.89 1.89 0 0 1 0 2.673L25.173 22.5l10.692 10.692a1.89 1.89 0 0 1 0 2.673 1.89 1.89 0 0 1-2.673 0L22.5 25.173 11.808 35.865a1.89 1.89 0 0 1-2.673 0 1.89 1.89 0 0 1 0-2.673L19.827 22.5 9.135 11.808a1.89 1.89 0 0 1 0-2.673 1.89 1.89 0 0 1 2.673 0L22.5 19.827 33.192 9.135a1.89 1.89 0 0 1 2.673 0z" fill="#${crossColor}" stroke="#000" stroke-width="1.688"/></g>`
        : `<circle cx="${x + squareSize / 2}" cy="${y + squareSize / 2}" r="${marksSize}" fill="#${marksColor}"/>`)
    }
  }

  const horizontal = FILES.split('')
  const vertical = Array.from({ length: 8 }, (item, idx) => 8 - idx)

  for (let i = 0; i < 8; i += 1) {
    const file = horizontal[whiteBottom ? 8 - i - 1 : i]
    const rank = vertical[whiteBottom ? 8 - i - 1 : i]

    svgElements.push(`<text transform="translate(${boardPadding + squareSize / 2 + i * squareSize - 3}, 10) scale(.65)" fill="#${textColor}">${file.toUpperCase()}</text>`)
    svgElements.push(`<text transform="translate(${squareSize + i * squareSize - 10}, ${squareSize * 8 + boardPadding * 2 - 3}) scale(.65)" fill="#${textColor}">${file.toUpperCase()}</text>`)

    svgElements.push(`<text transform="translate(4, ${squareSize + i * squareSize - 3}) scale(.7)" fill="#${textColor}">${rank}</text>`)
    svgElements.push(`<text transform="translate(${squareSize * 8 + boardPadding * 2 - 10}, ${squareSize + i * squareSize - 3}) scale(.7)" fill="#${textColor}">${rank}</text>`)
  }

  return stubSvg.split('{{bg}}').join(bgColor).split('{{board}}').join(svgElements.join(''))
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
