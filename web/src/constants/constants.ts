import {ValidThemeType, ThemeSelectButtonType, FrameOptionType, FilterType} from "./types";

export const VALID_THEMES = ["prom", "usagyuun"] as const;

export const VALID_FRAME_TYPES = ["singular", "double"] as const;

export const NUM_OF_CAPTURE_IMAGE = 6;

export const PRINT_PRICING = [
  {quantity: 1, price: 20000},
  {quantity: 2, price: 40000},
  {quantity: 3, price: 60000},
  {quantity: 4, price: 80000},
  {quantity: 5, price: 100000},
  {quantity: "5+", price: 15000},
];

export const MAX_PRINT_QUANTITY = 10;

export const CAPTURE_DURATION = 3;

export const FILTER_SELECT_DURATION = 25;

export const ThemeSelectButton: ThemeSelectButtonType[] = [
  {
    title: "PROM",
    image_src: "/prom.jpg",
    theme: "prom",
  },
  {
    title: "Usagyuuun",
    image_src: "/rabbit.jpg",
    theme: "usagyuun",
  },
];

export const MULTIPLIER = 1.3;

export const FRAME_WIDTH = 355 * MULTIPLIER;
export const FRAME_HEIGHT = 524 * MULTIPLIER;

export const IMAGE_WIDTH = 378 * MULTIPLIER;
export const IMAGE_HEIGHT = 560 * MULTIPLIER;

export const OFFSET_X = (IMAGE_WIDTH - FRAME_WIDTH) / 2;
export const OFFSET_Y = (47 / 3) * MULTIPLIER;

const USAGYUUN_X_POS = 12 * MULTIPLIER;
const USAGYUUN_Y_INIT_POS = 13 * MULTIPLIER;
const USAGYUUN_IMAGE_HEIGHT = 106 * MULTIPLIER;
const USAGYUUN_IMAGE_WIDTH = 152 * MULTIPLIER;
const USAGYUUN_Y_SLOT_SEPERATION = (index: number) => {
  return (122 * (index + 1) - (USAGYUUN_Y_INIT_POS / MULTIPLIER) * index) * MULTIPLIER;
};

const PROM_Y_INIT_POS = 20 * MULTIPLIER;
const PROM_IMAGE_HEIGHT = 210 * MULTIPLIER;
const PROM_IMAGE_WIDTH = 292 * MULTIPLIER;
const PROM_X_POS = 31 * MULTIPLIER;
const PROM_Y_SLOT_SEPERATION = (index: number) => {
  return (280 * (index + 1) - (PROM_Y_INIT_POS / MULTIPLIER) * index) * MULTIPLIER;
};

export const FrameOptions: {
  [key in ValidThemeType]: Array<FrameOptionType<key>>;
} = {
  prom: [
    {
      type: "singular",
      src: "/frame/prom/prom_1.png",
      thumbnail: "/frame/prom/thumbnail/prom_1.jpg",
      slotCount: 2,
      slotDimensions: {
        height: PROM_IMAGE_HEIGHT,
        width: PROM_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: PROM_Y_INIT_POS,
          x: PROM_X_POS,
        },

        {
          y: PROM_Y_SLOT_SEPERATION(0),
          x: PROM_X_POS,
        },
      ],
    },
    {
      type: "singular",
      src: "/frame/prom/prom_2.png",
      thumbnail: "/frame/prom/thumbnail/prom_2.jpg",
      slotCount: 2,
      slotDimensions: {
        height: PROM_IMAGE_HEIGHT,
        width: PROM_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: PROM_Y_INIT_POS,
          x: PROM_X_POS,
        },

        {
          y: PROM_Y_SLOT_SEPERATION(0),
          x: PROM_X_POS,
        },
      ],
    },
    {
      type: "singular",
      src: "/frame/prom/prom_3.png",
      thumbnail: "/frame/prom/thumbnail/prom_3.jpg",
      slotCount: 2,
      slotDimensions: {
        height: PROM_IMAGE_HEIGHT,
        width: PROM_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: PROM_Y_INIT_POS,
          x: PROM_X_POS,
        },

        {
          y: PROM_Y_SLOT_SEPERATION(0),
          x: PROM_X_POS,
        },
      ],
    },
    {
      type: "singular",
      src: "/frame/prom/prom_4.png",
      thumbnail: "/frame/prom/thumbnail/prom_4.jpg",
      slotCount: 2,
      slotDimensions: {
        height: PROM_IMAGE_HEIGHT,
        width: PROM_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: PROM_Y_INIT_POS,
          x: PROM_X_POS,
        },

        {
          y: PROM_Y_SLOT_SEPERATION(0),
          x: PROM_X_POS,
        },
      ],
    },

    {
      type: "singular",
      src: "/frame/prom/prom_5.png",
      thumbnail: "/frame/prom/thumbnail/prom_5.jpg",
      slotCount: 2,
      slotDimensions: {
        height: PROM_IMAGE_HEIGHT,
        width: PROM_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: PROM_Y_INIT_POS,
          x: PROM_X_POS,
        },

        {
          y: PROM_Y_SLOT_SEPERATION(0),
          x: PROM_X_POS,
        },
      ],
    },
    {
      type: "singular",
      src: "/frame/prom/prom_6.png",
      thumbnail: "/frame/prom/thumbnail/prom_6.jpg",
      slotCount: 2,
      slotDimensions: {
        height: PROM_IMAGE_HEIGHT,
        width: PROM_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: PROM_Y_INIT_POS,
          x: PROM_X_POS,
        },

        {
          y: PROM_Y_SLOT_SEPERATION(0),
          x: PROM_X_POS,
        },
      ],
    },
  ],
  usagyuun: [
    {
      type: "double",
      src: "/frame/usagyuun/usagyuun_1.png",
      thumbnail: "/frame/usagyuun/thumbnail/usagyuun_1.png",
      slotCount: 4,
      slotDimensions: {
        height: USAGYUUN_IMAGE_HEIGHT,
        width: USAGYUUN_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: USAGYUUN_Y_INIT_POS,
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(0),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(1),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(2),
          x: USAGYUUN_X_POS,
        },
      ],
    },
    {
      type: "double",
      src: "/frame/usagyuun/usagyuun_2.png",
      thumbnail: "/frame/usagyuun/thumbnail/usagyuun_2.png",
      slotCount: 4,
      slotDimensions: {
        height: USAGYUUN_IMAGE_HEIGHT,
        width: USAGYUUN_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: USAGYUUN_Y_INIT_POS,
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(0),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(1),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(2),
          x: USAGYUUN_X_POS,
        },
      ],
    },
    {
      type: "double",
      src: "/frame/usagyuun/usagyuun_3.png",
      thumbnail: "/frame/usagyuun/thumbnail/usagyuun_3.png",
      slotCount: 4,
      slotDimensions: {
        height: USAGYUUN_IMAGE_HEIGHT,
        width: USAGYUUN_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: USAGYUUN_Y_INIT_POS,
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(0),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(1),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(2),
          x: USAGYUUN_X_POS,
        },
      ],
    },
    {
      type: "double",
      src: "/frame/usagyuun/usagyuun_4.png",
      thumbnail: "/frame/usagyuun/thumbnail/usagyuun_4.png",
      slotCount: 4,
      slotDimensions: {
        height: USAGYUUN_IMAGE_HEIGHT,
        width: USAGYUUN_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: USAGYUUN_Y_INIT_POS,
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(0),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(1),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(2),
          x: USAGYUUN_X_POS,
        },
      ],
    },
    {
      type: "double",
      src: "/frame/usagyuun/usagyuun_5.png",
      thumbnail: "/frame/usagyuun/thumbnail/usagyuun_5.png",
      slotCount: 4,
      slotDimensions: {
        height: USAGYUUN_IMAGE_HEIGHT,
        width: USAGYUUN_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: USAGYUUN_Y_INIT_POS,
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(0),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(1),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(2),
          x: USAGYUUN_X_POS,
        },
      ],
    },
    {
      type: "double",
      src: "/frame/usagyuun/usagyuun_6.png",
      thumbnail: "/frame/usagyuun/thumbnail/usagyuun_6.png",
      slotCount: 4,
      slotDimensions: {
        height: USAGYUUN_IMAGE_HEIGHT,
        width: USAGYUUN_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: USAGYUUN_Y_INIT_POS,
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(0),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(1),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(2),
          x: USAGYUUN_X_POS,
        },
      ],
    },
    {
      type: "double",
      src: "/frame/usagyuun/usagyuun_7.png",
      thumbnail: "/frame/usagyuun/thumbnail/usagyuun_7.png",
      slotCount: 4,
      slotDimensions: {
        height: USAGYUUN_IMAGE_HEIGHT,
        width: USAGYUUN_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: USAGYUUN_Y_INIT_POS,
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(0),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(1),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(2),
          x: USAGYUUN_X_POS,
        },
      ],
    },
    {
      type: "double",
      src: "/frame/usagyuun/usagyuun_8.png",
      thumbnail: "/frame/usagyuun/thumbnail/usagyuun_8.png",
      slotCount: 4,
      slotDimensions: {
        height: USAGYUUN_IMAGE_HEIGHT,
        width: USAGYUUN_IMAGE_WIDTH,
      },
      slotPositions: [
        {
          y: USAGYUUN_Y_INIT_POS,
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(0),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(1),
          x: USAGYUUN_X_POS,
        },

        {
          y: USAGYUUN_Y_SLOT_SEPERATION(2),
          x: USAGYUUN_X_POS,
        },
      ],
    },
  ],
};

export const FILTERS: FilterType[] = [
  {name: "Original", filter: null, value: null},
  {name: "1977", filter: "filter-1977", value: "sepia(0.5) hue-rotate(-30deg) saturate(1.4)"},
  {name: "Aden", filter: "filter-aden", value: "sepia(0.2) brightness(1.15) saturate(1.4)"},
  {name: "Amaro", filter: "filter-amaro", value: "sepia(0.35) contrast(1.1) brightness(1.2) saturate(1.3)"},
  {name: "Ashby", filter: "filter-ashby", value: "sepia(0.5) contrast(1.2) saturate(1.8)"},
  {name: "Brannan", filter: "filter-brannan", value: "sepia(0.4) contrast(1.25) brightness(1.1) saturate(0.9) hue-rotate(-2deg)"},
  {name: "Brooklyn", filter: "filter-brooklyn", value: "sepia(0.25) contrast(1.25) brightness(1.25) hue-rotate(5deg)"},
  {name: "Charmes", filter: "filter-charmes", value: "sepia(0.25) contrast(1.25) brightness(1.25) saturate(1.35) hue-rotate(-5deg)"},
  {name: "Clarendon", filter: "filter-clarendon", value: "sepia(0.15) contrast(1.25) brightness(1.25) hue-rotate(5deg)"},
  {name: "Crema", filter: "filter-crema", value: "sepia(0.5) contrast(1.25) brightness(1.15) saturate(0.9) hue-rotate(-2deg)"},
  {name: "Dogpatch", filter: "filter-dogpatch", value: "sepia(0.35) saturate(1.1) contrast(1.5)"},
  {name: "Earlybird", filter: "filter-earlybird", value: "sepia(0.25) contrast(1.25) brightness(1.15) saturate(0.9) hue-rotate(-5deg)"},
  {name: "Gingham", filter: "filter-gingham", value: "contrast(1.1) brightness(1.1)"},
  {name: "Ginza", filter: "filter-ginza", value: "sepia(0.25) contrast(1.15) brightness(1.2) saturate(1.35) hue-rotate(-5deg)"},
  {name: "Hefe", filter: "filter-hefe", value: "sepia(0.4) contrast(1.5) brightness(1.2) saturate(1.4) hue-rotate(-10deg)"},
  {name: "Helena", filter: "filter-helena", value: "sepia(0.5) contrast(1.05) brightness(1.05) saturate(1.35)"},
  {name: "Hudson", filter: "filter-hudson", value: "sepia(0.25) contrast(1.2) brightness(1.2) saturate(1.05) hue-rotate(-15deg)"},
  {name: "Inkwell", filter: "filter-inkwell", value: "brightness(1.25) contrast(0.85) grayscale(1)"},
  {name: "Kelvin", filter: "filter-kelvin", value: "sepia(0.15) contrast(1.5) brightness(1.1) hue-rotate(-10deg)"},
  {name: "Juno", filter: "filter-juno", value: "sepia(0.35) contrast(1.15) brightness(1.15) saturate(1.8)"},
  {name: "Lark", filter: "filter-lark", value: "sepia(0.25) contrast(1.2) brightness(1.3) saturate(1.25)"},
  {name: "Lo-Fi", filter: "filter-lofi", value: "saturate(1.1) contrast(1.5)"},
  {name: "Ludwig", filter: "filter-ludwig", value: "sepia(0.25) contrast(1.05) brightness(1.05) saturate(2)"},
  {name: "Maven", filter: "filter-maven", value: "sepia(0.35) contrast(1.05) brightness(1.05) saturate(1.75)"},
  {name: "Mayfair", filter: "filter-mayfair", value: "contrast(1.1) brightness(1.15) saturate(1.1)"},
  {name: "Moon", filter: "filter-moon", value: "brightness(1.4) contrast(0.95) saturate(0) sepia(0.35)"},
  {name: "Perpetua", filter: "filter-perpetua", value: "contrast(1.1) brightness(1.25) saturate(1.1)"},
  {name: "Poprocket", filter: "filter-poprocket", value: "sepia(0.15) brightness(1.2)"},
  {name: "Reyes", filter: "filter-reyes", value: "sepia(0.75) contrast(0.75) brightness(1.25) saturate(1.4)"},
  {name: "Rise", filter: "filter-rise", value: "sepia(0.25) contrast(1.25) brightness(1.2) saturate(0.9)"},
  {name: "Sierra", filter: "filter-sierra", value: "sepia(0.25) contrast(1.5) brightness(0.9) hue-rotate(-15deg)"},
  {name: "Skyline", filter: "filter-skyline", value: "sepia(0.15) contrast(1.25) brightness(1.25) saturate(1.2)"},
  {name: "Slumber", filter: "filter-slumber", value: "sepia(0.35) contrast(1.25) saturate(1.25)"},
  {name: "Stinson", filter: "filter-stinson", value: "sepia(0.35) contrast(1.25) brightness(1.1) saturate(1.25)"},
  {name: "Sutro", filter: "filter-sutro", value: "sepia(0.4) contrast(1.2) brightness(0.9) saturate(1.4) hue-rotate(-10deg)"},
  {name: "Toaster", filter: "filter-toaster", value: "sepia(0.25) contrast(1.5) brightness(0.95) hue-rotate(-15deg)"},
  {name: "Valencia", filter: "filter-valencia", value: "sepia(0.25) contrast(1.1) brightness(1.1)"},
  {name: "Vesper", filter: "filter-vesper", value: "sepia(0.35) contrast(1.15) brightness(1.2) saturate(1.3)"},
  {name: "Walden", filter: "filter-walden", value: "sepia(0.35) contrast(0.8) brightness(1.25) saturate(1.4)"},
  {name: "Willow", filter: "filter-willow", value: "brightness(1.2) contrast(0.85) saturate(0.05) sepia(0.2)"},
  {name: "X-Pro II", filter: "filter-xpro-ii", value: "sepia(0.45) contrast(1.25) brightness(1.75) saturate(1.3) hue-rotate(-5deg)"},
];
