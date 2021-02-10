/* eslint-disable id-length, id-match */

const fs = require('fs')
const express = require('express')
const { StaticCanvas, loadSVGFromString, util: { groupSVGElements } } = require('fabric').fabric
const { Board } = require('chess/dist/board')

const app = express()
const stubSvg = fs.readFileSync('stub.svg', { encoding: 'utf-8' })

const W_CELL_COLOR = 'f0d9b5'
const B_CELL_COLOR = 'b58863'
const BG_COLOR = '212121'
const TEXT_COLOR = 'e5e5e5'
const MARKS_COLOR = 'aaa23b'
const MARKS_SIZE = 7
const BOARD_SIZE = 512
const SQUARE_SIZE = 45
const BOARD_PADDING = 15
const FILES = 'abcdefgh'

const renderSVG = (board, {
  marks = [],
  bgColor,
  marksSize,
  textColor,
  marksColor,
  bCellColor,
  wCellColor,
  squareSize,
  whiteBottom,
}) => {
  const svgElements = []

  for (let i = 0; i < board.squares.length; i += 1) {
    const { file, rank, piece } = board.squares[i]
    const fileNumber = FILES.indexOf(file) + 1
    const x = ((whiteBottom ? 9 - fileNumber : fileNumber) - 1) * squareSize + BOARD_PADDING
    const y = ((whiteBottom ? rank : 9 - rank) - 1) * squareSize + BOARD_PADDING
    const color = (fileNumber + rank) % 2 ? wCellColor : bCellColor
    const squareId = `${file}${rank}`

    svgElements.push(`<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" class="square ${squareId}" stroke="none" fill="#${color}"/>`)

    if (piece) {
      svgElements.push(`<use xlink:href="#${piece.side.name}-${piece.type}" transform="translate(${x}, ${y})"/>`)
    }
    if (marks.includes(squareId)) {
      if (piece) {
        svgElements.push(`<use xlink:href="#xx" transform="translate(${x}, ${y})"/>`)
      } else {
      svgElements.push(`<circle cx="${x + squareSize / 2}" cy="${y + squareSize / 2}" r="${marksSize}" fill="#${marksColor}"/>`)
      }
    }
  }

  const horizontal = FILES.split('')
  const vertical = Array.from({ length: 8 }, (item, idx) => 8 - idx)

  for (let i = 0; i < 8; i += 1) {
    const file = horizontal[whiteBottom ? i : 8 - i - 1]
    const rank = vertical[whiteBottom ? i : 8 - i - 1]

    svgElements.push(`<text transform="translate(${BOARD_PADDING + squareSize / 2 + i * squareSize - 3}, 10) scale(.65)" fill="#${textColor}">${file.toUpperCase()}</text>`)
    svgElements.push(`<text transform="translate(${squareSize + i * squareSize - 10}, ${squareSize * 8 + BOARD_PADDING * 2 - 3}) scale(.65)" fill="#${textColor}">${file.toUpperCase()}</text>`)

    svgElements.push(`<text transform="translate(4, ${squareSize + i * squareSize - 3}) scale(.7)" fill="#${textColor}">${rank}</text>`)
    svgElements.push(`<text transform="translate(${squareSize * 8 + BOARD_PADDING * 2 - 10}, ${squareSize + i * squareSize - 3}) scale(.7)" fill="#${textColor}">${rank}</text>`)
  }

  return stubSvg.split('{{bg}}').join(bgColor).split('{{board}}').join(svgElements.join(''))
}

app.get('/:fen.jpeg', (req, res) => {
  console.time('gen time')
  const {
    rotate = 0,
    marks: marksList = '',
    bg_color: bgColor = BG_COLOR,
    marks_color: marksColor = MARKS_COLOR,
    marks_size: marksSize = MARKS_SIZE,
    board_size: boardSize = BOARD_SIZE,
    text_color: textColor = TEXT_COLOR,
    square_size: squareSize = SQUARE_SIZE,
    board_padding: boardPadding = BOARD_PADDING,
    w_cell_color: wCellColor = W_CELL_COLOR,
    b_cell_color: bCellColor = B_CELL_COLOR,
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
