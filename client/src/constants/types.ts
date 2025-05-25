export type ValidThemeType = "prom";
// export type ValidThemeType = "prom" | "usagyuun";

export type ValidFrameType = "singular" | "double";

export interface PhotoOptions<T extends ValidThemeType> {
  theme: {
    name: T;
    frame: {
      type: ValidFrameType;
      src: `/frame/${T}/${T}_${number}.${string}`;
      thumbnail?: `/frame/${T}/thumbnail/${T}_${number}.${string}`;
      slotCount: number;
      slotDimensions: {
        width: number;
        height: number;
      };
      slotPositions: {
        x: number;
        y: number;
      }[];
    };
  } | null;
  quantity: number | null;
  images: Array<{
    id: string;
    data: string;
    href: string;
  }>;
  selectedImages: Array<{
    id: string;
    data: string;
    href: string;
  }>;
  video: {
    data: Blob | null;
    r2_url: string | null;
  };
  id: string | null;
  error: boolean;
  isTransition: boolean;
  frameType: ValidFrameType;
}

export interface ThemeSelectButtonType {
  title: string;
  image_src: string;
  theme: ValidThemeType;
  style?: { [key: string]: string };
}

export interface FrameOptionType<T extends ValidThemeType = ValidThemeType> {
  type: ValidFrameType;
  src: `/frame/${T}/${T}_${number}.${string}`;
  thumbnail?: `/frame/${T}/thumbnail/${T}_${number}.${string}`;
  slotCount: number;
  slotDimensions: {
    width: number;
    height: number;
  };
  slotPositions: {
    x: number;
    y: number;
  }[];
}

export interface FilterType {
  name: string;
  filter: string | null;
  value: string | null;
}
