/**
 * Quran Pages Image Service
 * Powered by https://quran.yousefheiba.com/api/quranPagesImage
 * Provides all 604 high-resolution Madinah Mushaf pages with caching and prefetching
 */

export interface QuranPageItem {
  page_number: number;
  page_url: string;
}

export interface QuranPagesImageResponse {
  status: string;
  total_pages: number;
  pages: QuranPageItem[];
}

class QuranPagesService {
  private pagesCache: Map<number, string> = new Map();
  private isLoaded = false;
  private loadPromise: Promise<Map<number, string>> | null = null;

  /**
   * Padded 3-digit page number (1 -> "001", 10 -> "010", 604 -> "604")
   */
  formatPageCode(page: number): string {
    const clamped = Math.max(1, Math.min(604, Math.floor(page)));
    if (clamped < 10) return `00${clamped}`;
    if (clamped < 100) return `0${clamped}`;
    return `${clamped}`;
  }

  /**
   * Deterministic direct high-res URL for any page (1..604)
   */
  getPageImageUrl(page: number): string {
    const clamped = Math.max(1, Math.min(604, Math.floor(page)));
    if (this.pagesCache.has(clamped)) {
      return this.pagesCache.get(clamped)!;
    }
    const code = this.formatPageCode(clamped);
    return `https://quran.yousefheiba.com/api/quran-pages/${code}.png`;
  }

  /**
   * Fallback mirror URLs in case of connection drop
   */
  getPageMirrors(page: number): string[] {
    const clamped = Math.max(1, Math.min(604, Math.floor(page)));
    const code = this.formatPageCode(clamped);
    return [
      this.getPageImageUrl(clamped),
      `https://quran.yousefheiba.com/api/quran-pages/${code}.png`,
      `https://android.quran.com/data/width_1260/page${code}.png`,
      `https://everyayah.com/data/quranpages_png/page${code}.png`,
      `https://cdn.islamic.network/quran/images/high-resolution/${clamped}.png`,
    ];
  }

  /**
   * Fetches and indexes the entire 604-page catalog from https://quran.yousefheiba.com/api/quranPagesImage
   */
  async loadAllPages(): Promise<Map<number, string>> {
    if (this.isLoaded && this.pagesCache.size >= 604) {
      return this.pagesCache;
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        const resp = await fetch("https://quran.yousefheiba.com/api/quranPagesImage", {
          cache: "force-cache",
        });
        if (resp.ok) {
          const data: QuranPagesImageResponse = await resp.json();
          if (data && Array.isArray(data.pages)) {
            data.pages.forEach((p) => {
              this.pagesCache.set(p.page_number, p.page_url);
            });
            this.isLoaded = true;
            return this.pagesCache;
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote page list, using fallback formula:", err);
      }

      // Pre-seed 1..604 with default formula
      for (let i = 1; i <= 604; i++) {
        if (!this.pagesCache.has(i)) {
          const code = this.formatPageCode(i);
          this.pagesCache.set(i, `https://quran.yousefheiba.com/api/quran-pages/${code}.png`);
        }
      }
      this.isLoaded = true;
      return this.pagesCache;
    })();

    return this.loadPromise;
  }

  /**
   * Preload adjacent pages into browser cache for instant page turning
   */
  prefetchAdjacentPages(currentPage: number) {
    const pagesToPrefetch = [currentPage + 1, currentPage - 1, currentPage + 2].filter(
      (p) => p >= 1 && p <= 604
    );

    pagesToPrefetch.forEach((p) => {
      const url = this.getPageImageUrl(p);
      const img = new Image();
      img.src = url;
    });
  }
}

export const quranPagesService = new QuranPagesService();
