declare module 'palette.js' {
    interface Palette {
      getPalette(img: HTMLImageElement, numColors: number): Promise<number[][]>;
    }
  
    const Palette: Palette;
    export default Palette;
  }
  