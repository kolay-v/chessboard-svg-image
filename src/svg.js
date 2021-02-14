const makeSquare = ({ x, y, squareSize, squareId, color }) => `<rect
  x="${x}"
  y="${y}"
  width="${squareSize}"
  height="${squareSize}"
  class="square ${squareId}"
  stroke="none"
  fill="#${color}"
/>`

const makePiece = ({ x, y, piece, scale }) => `<use
  xlink:href="#${piece.side.name}-${piece.type}"
  transform="translate(${x}, ${y}) scale(${scale})"
/>`

const makeCross = ({ x, y, crossColor, scale }) => `<g
  transform="translate(${x}, ${y}) scale(${scale})">
  <path
    d="M35.865 9.135a1.89 1.89 0 0 1 0 2.673L25.173 22.5l10.692 10.692a1.89 1.89 0 0 1 0 2.673 1.89 1.89 0 0 1-2.673 0L22.5 25.173 11.808 35.865a1.89 1.89 0 0 1-2.673 0 1.89 1.89 0 0 1 0-2.673L19.827 22.5 9.135 11.808a1.89 1.89 0 0 1 0-2.673 1.89 1.89 0 0 1 2.673 0L22.5 19.827 33.192 9.135a1.89 1.89 0 0 1 2.673 0z"
    fill="#${crossColor}"
    stroke="#000"
    stroke-width="1.688"
  />
</g>`

const makeDot = ({ x, y, squareSize, marksSize, marksColor, scale }) => `<circle
  cx="${x + squareSize / 2}"
  cy="${y + squareSize / 2}"
  r="${marksSize * scale}"
  fill="#${marksColor}"
/>`

const makeScale = ({ i, boardPadding, squareSize, textColor, file, rank }) => `<text
  transform="translate(${boardPadding + squareSize / 2 + i * squareSize - 3}, 10) scale(.75)"
  fill="#${textColor}"
>${file.toUpperCase()}</text>
<text
  transform="translate(${squareSize + i * squareSize - 10}, ${squareSize * 8 + boardPadding * 2 - 3}) scale(.75)"
  fill="#${textColor}"
>${file.toUpperCase()}</text>
<text
  transform="translate(4, ${squareSize + i * squareSize - 3}) scale(.75)"
  fill="#${textColor}"
>${rank}</text>
<text
  transform="translate(${squareSize * 8 + boardPadding * 2 - 10}, ${squareSize + i * squareSize - 3}) scale(.75)"
  fill="#${textColor}"
>${rank}</text>`

const makeArrow = ({
  fromFile,
  fromRank,
  toFile,
  toRank,
  color = '00ff0080',
  squareSize,
  boardPadding,
}) => {
  const fromIdx = 'abcdefgh'.indexOf(fromFile)
  const toIdx = 'abcdefgh'.indexOf(toFile)
  const svgElements = []
  const fromX = (fromIdx + 0.5) * squareSize + boardPadding
  const fromY = (7.5 - fromRank + 1) * squareSize + boardPadding
  const toX = (toIdx + 0.5) * squareSize + boardPadding
  const toY = (7.5 - toRank + 1) * squareSize + boardPadding
  const dx = toX - fromX
  const dy = toY - fromY
  const hypot = Math.hypot(dx, dy)
  const shaftX = toX - dx * (squareSize * 0.1 + squareSize * 0.75) / hypot
  const shaftY = toY - dy * (squareSize * 0.1 + squareSize * 0.75) / hypot
  const tipX = toX - dx * squareSize * 0.1 / hypot
  const tipY = toY - dy * squareSize * 0.1 / hypot

  svgElements.push(`<line
  x1="${fromX}"
  y1="${fromY}"
  x2="${shaftX}"
  y2="${shaftY}"
  stroke-width="${squareSize * 0.2}"
  stroke="#${color}"
></line>`)

  const marker = [[tipX, tipY],
    [shaftX + dy * 0.5 * squareSize * 0.75 / hypot,
      shaftY - dx * 0.5 * squareSize * 0.75 / hypot],
    [shaftX - dy * 0.5 * squareSize * 0.75 / hypot,
      shaftY + dx * 0.5 * squareSize * 0.75 / hypot]]

  svgElements.push(`<polygon
  points="${marker.map(([x, y]) => `${x},${y}`).join(' ')}"
  fill="#${color}"
></polygon>`)

  return svgElements.join('')
}

module.exports = {
  makeDot,
  makeArrow,
  makeCross,
  makePiece,
  makeScale,
  makeSquare,
}
