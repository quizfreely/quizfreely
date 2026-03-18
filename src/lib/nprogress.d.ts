declare module 'nprogress' {
  interface NProgressOptions {
    minimum?: number;
    template?: string;
    easing?: string;
    speed?: number;
    trickle?: boolean;
    trickleSpeed?: number;
    showSpinner?: boolean;
    parent?: string;
    barSelector?: string;
    spinnerSelector?: string;
  }

  interface NProgress {
    version: string;
    settings: NProgressOptions;
    status: number | null;
    configure(options: NProgressOptions): NProgress;
    set(number: number): NProgress;
    isStarted(): boolean;
    start(): NProgress;
    done(force?: boolean): NProgress;
    inc(amount?: number): NProgress;
    remove(): void;
  }

  const nprogress: NProgress;
  export default nprogress;
}
