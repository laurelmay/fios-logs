/**
 * Configuration for a FiOS extender device.
 */
export interface ExtenderConfiguration {
  /**
   * The administrator password to use to sign in to the FiOS gateway and
   * extenders.
   *
   * @default The router's admin password
   */
  adminPassword?: string;

  /**
   * The hostname or IP address of the extender.
   *
   * @default myfiosgateway.com
   */
  address: string;
}

/**
 * The format for configuration of the log fetcher.
 */
export interface Configuration {
  /**
   * The administrator password to use to sign in to the FiOS gateway and
   * extenders.
   *
   * The application assumes that all extenders use the same password as
   * the gateway.
   */
  adminPassword: string;

  /**
   * The hostname or IP address of the FiOS gateway.
   *
   * @default myfiosgateway.com
   */
  gatewayAddress?: string;

  /**
   * Any extenders on the network.
   *
   * @default none
   */
  extenders?: ExtenderConfiguration[];
}
