declare module "qz-tray" {
  interface QzConfig {
    readonly config: unknown;
  }
  const qz: {
    api: { setSha256Type(hasher: (message: string) => Promise<string>): void };
    security: {
      setCertificatePromise(
        callback: (
          resolve: (certificate: string) => void,
          reject: (error: unknown) => void,
        ) => void,
      ): void;
      setSignatureAlgorithm(algorithm: "SHA512"): void;
      setSignaturePromise(
        callback: (
          message: string,
        ) => (
          resolve: (signature: string) => void,
          reject: (error: unknown) => void,
        ) => void,
      ): void;
    };
    websocket: {
      isActive(): boolean;
      connect(options?: { retries?: number }): Promise<void>;
    };
    printers: { find(): Promise<string[]> };
    configs: {
      create(
        printer: string,
        options?: { encoding?: string; jobName?: string },
      ): QzConfig;
    };
    print(
      config: QzConfig,
      data: Array<{
        type: "raw";
        format: "command";
        flavor: "plain";
        data: string;
      }>,
    ): Promise<void>;
  };
  export default qz;
}
