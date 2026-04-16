import { memo } from 'react'
import { Tile, type TileValue } from '../types/tiles'

interface Props {
  tile: TileValue
}

function TileRenderer({ tile }: Props) {
  const cls = TILE_CLASS[tile] ?? 'tile-empty'
  const deco = TILE_DECO[tile]

  return (
    <div className={`tile ${cls}`} aria-hidden="true">
      {deco && <div className={`tile-deco ${deco}`} />}
    </div>
  )
}

const TILE_CLASS: Partial<Record<TileValue, string>> = {
  [Tile.EMPTY]:         'tile-empty',
  [Tile.FLOOR_WOOD]:    'tile-floor-wood',
  [Tile.FLOOR_WOOD_2]:  'tile-floor-wood-2',
  [Tile.FLOOR_STONE]:   'tile-floor-stone',
  [Tile.WALL_TOP]:      'tile-wall-top',
  [Tile.WALL_MID]:      'tile-wall-mid',
  [Tile.WALL_BOTTOM]:   'tile-wall-bottom',
  [Tile.WALL_CORNER_L]: 'tile-wall-corner',
  [Tile.WALL_CORNER_R]: 'tile-wall-corner tile-flip',
  [Tile.SHELF_DART]:    'tile-shelf tile-shelf-dart',
  [Tile.SHELF_FLUTTER]: 'tile-shelf tile-shelf-flutter',
  [Tile.SHELF_REACT]:   'tile-shelf tile-shelf-react',
  [Tile.TABLE_H]:       'tile-table',
  [Tile.TABLE_V]:       'tile-table tile-table-v',
  [Tile.CHAIR_DOWN]:    'tile-chair',
  [Tile.CHAIR_UP]:      'tile-chair tile-chair-up',
  [Tile.CANDLE]:        'tile-wall-mid tile-candle',
  [Tile.LAMP]:          'tile-floor-wood tile-lamp',
  [Tile.PLANT]:         'tile-wall-mid tile-plant',
  [Tile.MAP_WALL]:      'tile-wall-mid tile-map-wall',
  [Tile.BOOKS_TABLE]:   'tile-floor-wood tile-books-table',
  [Tile.CARPET]:        'tile-carpet',
  [Tile.CARPET_EDGE]:   'tile-carpet-edge',
  [Tile.NPC_READER]:    'tile-carpet tile-npc tile-npc-reader',
  [Tile.NPC_WALKER]:    'tile-floor-wood tile-npc tile-npc-walker',
  [Tile.NPC_LIBRARIAN]: 'tile-floor-wood tile-npc tile-npc-librarian',
  [Tile.SIGN_DART]:     'tile-wall-bottom tile-sign tile-sign-dart',
  [Tile.SIGN_FLUTTER]:  'tile-wall-bottom tile-sign tile-sign-flutter',
  [Tile.SIGN_REACT]:    'tile-wall-bottom tile-sign tile-sign-react',
  [Tile.DOOR]:          'tile-door',
}

const TILE_DECO: Partial<Record<TileValue, string>> = {
  [Tile.CANDLE]:        'deco-candle',
  [Tile.LAMP]:          'deco-lamp',
  [Tile.PLANT]:         'deco-plant',
  [Tile.MAP_WALL]:      'deco-map',
  [Tile.BOOKS_TABLE]:   'deco-books',
  [Tile.NPC_READER]:    'deco-npc-reader',
  [Tile.NPC_WALKER]:    'deco-npc-walker',
  [Tile.NPC_LIBRARIAN]: 'deco-npc-librarian',
  [Tile.SIGN_DART]:     'deco-sign',
  [Tile.SIGN_FLUTTER]:  'deco-sign',
  [Tile.SIGN_REACT]:    'deco-sign',
  [Tile.DOOR]:          'deco-door',
}

export default memo(TileRenderer)
