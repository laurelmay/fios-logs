/**
 * Data about the types of logs on a FiOS network device.
 */
export interface LogData {
  /**
   * The type of log
   */
  logType: string;

  /**
   * The path where the actual log is fetched from on the device.
   */
  requestPath: string;

  /**
   * The webpage that initiates a request for the underlying log file.
   */
  webUiPath: string;
}

/**
 * The logs available on a FiOS Gateway.
 */
export const routerLogData: LogData[] = [
  {
    logType: "system",
    requestPath: "/tmp/messages_SYS.log",
    webUiPath: "/#/adv/monitoring/log/system",
  },
  {
    logType: "security",
    requestPath: "/tmp/messages_SECURITY.log",
    webUiPath: "/#/adv/monitoring/log/security",
  },
  {
    logType: "advanced",
    requestPath: "/tmp/messages_ADV.log",
    webUiPath: "/#/adv/monitoring/log/advanced",
  },
  {
    logType: "firewall",
    requestPath: "/tmp/messages_FW.log",
    webUiPath: "/#/adv/monitoring/log/firewall",
  },
  {
    logType: "wandhcp",
    requestPath: "/tmp/messages_WDHCP.log",
    webUiPath: "/#/adv/monitoring/log/wandhcp",
  },
  {
    logType: "landhcp",
    requestPath: "/tmp/messages_LDHCP.log",
    webUiPath: "/#/adv/monitoring/log/landhcp",
  },
];

/**
 * The logs available on a FiOS Extender.
 */
export const extenderLogData: LogData[] = [
  {
    logType: "system",
    requestPath: "/tmp/messages_SYS.log",
    webUiPath: "/#/ext/monitoring/log/system",
  },
  {
    logType: "advanced",
    requestPath: "/tmp/messages_ADV.log",
    webUiPath: "/#/ext/monitoring/log/advanced",
  },
  {
    logType: "dhcp",
    requestPath: "/tmp/messages_WDHCP.log",
    webUiPath: "/#/ext/monitoring/log/dhcp",
  },
  {
    logType: "bhm",
    requestPath: "/tmp/messages_BHM.log",
    webUiPath: "/#/ext/monitoring/log/BHM",
  },
];
