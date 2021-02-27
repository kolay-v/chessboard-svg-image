# chessboard-svg-img

Chess board JPEG image generator microservice

## Overview

Simple `image/jpeg` mime type rendered image on output.

### Features
- Board rotation
- JPEG stream without file creation
- Marks dot/cross for display allowed moves
- Arrow from square to square
- Configurable colors and more...

## Usage

Start:

```sh
npm run dev
```

#### URL structure

```js
const fen = 'rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBKQBNR'

const url = `http://localhost:3001/${fen}.jpg?${queryString}`
```

#### Query parameters

| Name             | Type     | Default    | Description |
| ---------------- | -------- | ---------- | ----------- |
| **debug**        | `number` | `0`        | Turns on pure SVG markup |
| **rotate**       | `number` | `0`        | Turns board to from black side view |
| **arrows**       | `array`  | `[]`       | The array of arrows `/(?<fromFile>[a-h])(?<fromRank>\d)(?<toFile>[a-h])(?<toRank>\d)(?<color>[0-9a-f]{3,8})?/` |
| **marks**        | `string` | `''`       | The comma separated list of mark/cross on piece |
| **board_size**   | `number` | `512`      | Outer board size |
| **marks_size**   | `number` | `5`        | Size of marks on pieceless squares |
| **bg_color**     | `string` | `212121`   | Color of the background (the border around squares) of the board |
| **text_color**   | `string` | `e5e5e5`   | Color of text around the board |
| **cross_color**  | `string` | `ff2500`   | Color of cross fill |
| **marks_color**  | `string` | `aaa23b`   | Color of marks on pieceless squares |
| **b_cell_color** | `string` | `b58863`   | Color of black square |
| **w_cell_color** | `string` | `f0d9b5`   | Color of white square |

## Develop
