interface Window {
  __cmd?: { open: () => void; hire: () => void };
  __matrix?: { open: () => void; close: () => void };
  __access?: { open: (url: string, host?: string) => void };
}
