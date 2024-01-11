const { FILES } = require('./config')

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
  color = '00308880',
  knight,
  squareSize,
  whiteBottom,
  boardPadding,
}) => {
  fromRank = whiteBottom ? fromRank : 9 - fromRank
  toRank = whiteBottom ? toRank : 9 - toRank
  const letters = whiteBottom ? FILES : FILES.split('').reverse().join('')
  const fromIdx = letters.indexOf(fromFile)
  const toIdx = letters.indexOf(toFile)

  const svgElements = []

  const fromX = (fromIdx + 0.5) * squareSize + boardPadding
  const fromY = (7.5 - fromRank + 1) * squareSize + boardPadding
  const toX = (toIdx + 0.5) * squareSize + boardPadding
  const toY = (7.5 - toRank + 1) * squareSize + boardPadding
  const dx = toX - fromX
  const dy = toY - fromY
  // from tail
  // to head

  let angle = Math.atan2(
    fromIdx - toIdx,
    fromIdx - toIdx,
  ) * (180 / Math.PI)
  let svgTransform = `rotate(${angle},${fromX},${fromY})`
  let arrowPoints

  const lineWidthOffset = 0.1 * squareSize
  const markerOffset = 0.35 * squareSize
  const markerSize = 0.5 * squareSize
  if (knight) {
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    arrowPoints = [
      [fromX + lineWidthOffset, fromY + markerOffset],
      [fromX - lineWidthOffset, fromY + markerOffset],
      [fromX - lineWidthOffset, fromY + ady + lineWidthOffset],
      [fromX + adx - markerOffset, fromY + ady + lineWidthOffset],
      [
        fromX + adx - markerOffset,
        fromY + ady + markerSize / 2,
      ],
      [fromX + adx, fromY + ady],
      [
        fromX + adx - markerOffset,
        fromY + ady - markerSize / 2,
      ],
      [fromX + adx - markerOffset, fromY + ady - lineWidthOffset],
      [fromX + lineWidthOffset, fromY + ady - lineWidthOffset],
    ]

    if (dx < 0 && dy > 0) {
      svgTransform = `translate(${fromX * 2},0) scale(-1,1)`
    } else if (dx < 0 && dy < 0) {
      svgTransform = `rotate(180,${fromX},${fromY})`
    } else if (dx > 0 && dy > 0) {
      svgTransform = (
        `translate(${fromX * 2},${fromY * 2}) scale(-1,  -1) rotate({180},${fromX},${fromY})`
      )
    } else {
      svgTransform = `translate(0,${fromY * 2}) scale(1,  -1) `
    }
  } else {
    const hypot = Math.hypot(dx, dy)

    arrowPoints = [
      [fromX + lineWidthOffset, fromY + markerOffset],
      [fromX - lineWidthOffset, fromY + markerOffset],
      [fromX - lineWidthOffset, fromY + hypot - markerOffset],
      [
        fromX - markerSize / 2,
        fromY + hypot - markerOffset,
      ],
      [fromX, fromY + hypot],
      [fromX + markerSize / 2, fromY + hypot - markerOffset],
      [fromX + lineWidthOffset, fromY + hypot - markerOffset],
    ]
  }
  svgElements.push(`<polygon
    points="${arrowPoints.map(([x, y]) => `${x},${y}`).join(' ')}"
    transform="${svgTransform}"
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
