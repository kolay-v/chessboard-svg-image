const makeSquare = ({ x, y, squareSize, squareId, color }) => `<rect
  x="${x}"
  y="${y}"
  width="${squareSize}"
  height="${squareSize}"
  class="square ${squareId}"
  stroke="none"
  fill="#${color}"
/>`

const makePiece = ({ x, y, piece }) => `<use
  xlink:href="#${piece.side.name}-${piece.type}"
  transform="translate(${x}, ${y})"
/>`

const makeCross = ({ x, y, crossColor }) => `<g transform="translate(${x}, ${y})">
  <path
    d="M35.865 9.135a1.89 1.89 0 0 1 0 2.673L25.173 22.5l10.692 10.692a1.89 1.89 0 0 1 0 2.673 1.89 1.89 0 0 1-2.673 0L22.5 25.173 11.808 35.865a1.89 1.89 0 0 1-2.673 0 1.89 1.89 0 0 1 0-2.673L19.827 22.5 9.135 11.808a1.89 1.89 0 0 1 0-2.673 1.89 1.89 0 0 1 2.673 0L22.5 19.827 33.192 9.135a1.89 1.89 0 0 1 2.673 0z"
    fill="#${crossColor}"
    stroke="#000"
    stroke-width="1.688"
  />
</g>`

const makeDot = ({ x, y, squareSize, marksSize, marksColor }) => `<circle
  cx="${x + squareSize / 2}"
  cy="${y + squareSize / 2}"
  r="${marksSize}"
  fill="#${marksColor}"
/>`

const makeScale = ({ i, boardPadding, squareSize, textColor, file, rank }) => `<text
  transform="translate(${boardPadding + squareSize / 2 + i * squareSize - 3}, 10) scale(.65)"
  fill="#${textColor}"
>${file.toUpperCase()}</text>
<text
  transform="translate(${squareSize + i * squareSize - 10}, ${squareSize * 8 + boardPadding * 2 - 3}) scale(.65)"
  fill="#${textColor}"
>${file.toUpperCase()}</text>
<text
  transform="translate(4, ${squareSize + i * squareSize - 3}) scale(.7)"
  fill="#${textColor}"
>${rank}</text>
<text
  transform="translate(${squareSize * 8 + boardPadding * 2 - 10}, ${squareSize + i * squareSize - 3}) scale(.7)"
  fill="#${textColor}"
>${rank}</text>`

module.exports = {
  makeDot,
  makeCross,
  makePiece,
  makeScale,
  makeSquare,
}
