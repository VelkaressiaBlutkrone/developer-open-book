export const Tile = {
  EMPTY:         0x00,
  FLOOR_WOOD:    0x01,
  FLOOR_WOOD_2:  0x02,
  FLOOR_STONE:   0x03,

  WALL_TOP:      0x10,
  WALL_MID:      0x11,
  WALL_BOTTOM:   0x12,
  WALL_CORNER_L: 0x13,
  WALL_CORNER_R: 0x14,

  SHELF_DART:    0x20,
  SHELF_FLUTTER: 0x21,
  SHELF_REACT:   0x22,

  TABLE_H:       0x30,
  TABLE_V:       0x31,
  CHAIR_DOWN:    0x32,
  CHAIR_UP:      0x33,

  CANDLE:        0x40,
  LAMP:          0x41,
  PLANT:         0x42,
  MAP_WALL:      0x43,
  BOOKS_TABLE:   0x44,

  CARPET:        0x50,
  CARPET_EDGE:   0x51,

  NPC_READER:    0x60,
  NPC_WALKER:    0x61,
  NPC_LIBRARIAN: 0x62,

  SIGN_DART:     0x70,
  SIGN_FLUTTER:  0x71,
  SIGN_REACT:    0x72,

  DOOR:          0x80,
} as const

export type TileValue = typeof Tile[keyof typeof Tile]

export type TileMap = TileValue[][]

export interface InteractiveZone {
  row: number
  col: number
  width: number
  height: number
  category: 'dart' | 'flutter' | 'react'
  label: string
}
