/**
 * 时间处理工具库
 * 用于在前端处理 ISO 8601 UTC 时间字符串
 * 
 * 使用方式：
 * import { formatLocalDateTime, getRelativeTime } from "@/lib/datetime";
 * 
 * const localTime = formatLocalDateTime("2026-01-15T10:30:45.123Z");
 * const relativeTime = getRelativeTime("2026-01-15T10:30:45.123Z");
 */

/**
 * 将 ISO 8601 UTC 时间字符串转换为本地时间字符串
 * 
 * @param isoString - ISO 8601 UTC 时间字符串 (如: "2026-01-15T10:30:45.123Z")
 * @returns 格式化的本地时间字符串 (如: "2026-01-15 18:30:45")
 * 
 * @example
 * formatLocalDateTime("2026-01-15T10:30:45.123Z")
 * // 输出: "2026-01-15 18:30:45" (取决于用户时区)
 */
export function formatLocalDateTime(isoString: string | Date): string {
  const date = new Date(isoString);
  
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 将 ISO 8601 UTC 时间字符串转换为本地日期字符串
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 格式化的本地日期字符串 (如: "2026-01-15")
 * 
 * @example
 * formatLocalDate("2026-01-15T10:30:45.123Z")
 * // 输出: "2026-01-15"
 */
export function formatLocalDate(isoString: string | Date): string {
  const date = new Date(isoString);
  
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 将 ISO 8601 UTC 时间字符串转换为本地时间字符串
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 格式化的本地时间字符串 (如: "18:30:45")
 * 
 * @example
 * formatLocalTime("2026-01-15T10:30:45.123Z")
 * // 输出: "18:30:45" (取决于用户时区)
 */
export function formatLocalTime(isoString: string | Date): string {
  const date = new Date(isoString);
  
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 获取相对时间字符串 (如: "2小时前", "3天前")
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 相对时间字符串
 * 
 * @example
 * getRelativeTime("2026-01-15T08:30:45.123Z") // 当前时间为 2026-01-15T10:30:45.123Z
 * // 输出: "2小时前"
 */
export function getRelativeTime(isoString: string | Date): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSecs < 60) {
    return "刚刚";
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}周前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}月前`;
  } else {
    return `${diffYears}年前`;
  }
}

/**
 * 判断时间是否已过期
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 是否已过期
 * 
 * @example
 * isExpired("2026-01-15T10:30:45.123Z") // 当前时间为 2026-01-15T11:30:45.123Z
 * // 输出: true
 */
export function isExpired(isoString: string | Date): boolean {
  const date = new Date(isoString);
  return date < new Date();
}

/**
 * 判断时间是否在未来
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 是否在未来
 * 
 * @example
 * isFuture("2026-02-15T10:30:45.123Z") // 当前时间为 2026-01-15T11:30:45.123Z
 * // 输出: true
 */
export function isFuture(isoString: string | Date): boolean {
  const date = new Date(isoString);
  return date > new Date();
}

/**
 * 获取距离指定时间的剩余时间
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 剩余时间对象 { days, hours, minutes, seconds, isExpired }
 * 
 * @example
 * getTimeRemaining("2026-02-14T10:30:45.123Z") // 当前时间为 2026-01-15T10:30:45.123Z
 * // 输出: { days: 30, hours: 0, minutes: 0, seconds: 0, isExpired: false }
 */
export function getTimeRemaining(isoString: string | Date) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  const hours = Math.floor((diffMs / 1000 / 60 / 60) % 24);
  const days = Math.floor(diffMs / 1000 / 60 / 60 / 24);
  
  return { days, hours, minutes, seconds, isExpired: false };
}

/**
 * 格式化剩余时间字符串
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 格式化的剩余时间字符串 (如: "30天 0小时 0分钟")
 * 
 * @example
 * formatTimeRemaining("2026-02-14T10:30:45.123Z")
 * // 输出: "30天 0小时 0分钟"
 */
export function formatTimeRemaining(isoString: string | Date): string {
  const { days, hours, minutes, seconds, isExpired } = getTimeRemaining(isoString);
  
  if (isExpired) {
    return "已过期";
  }
  
  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (seconds > 0 && parts.length === 0) parts.push(`${seconds}秒`);
  
  return parts.join(" ");
}

/**
 * 比较两个时间
 * 
 * @param date1 - 第一个时间
 * @param date2 - 第二个时间
 * @returns 比较结果 (-1: date1 < date2, 0: date1 === date2, 1: date1 > date2)
 * 
 * @example
 * compareDateTime("2026-01-15T10:30:45.123Z", "2026-01-15T11:30:45.123Z")
 * // 输出: -1
 */
export function compareDateTime(date1: string | Date, date2: string | Date): -1 | 0 | 1 {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * 获取日期范围内的所有日期
 * 
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @returns 日期数组
 * 
 * @example
 * getDateRange("2026-01-15T00:00:00.000Z", "2026-01-17T00:00:00.000Z")
 * // 输出: ["2026-01-15", "2026-01-16", "2026-01-17"]
 */
export function getDateRange(startDate: string | Date, endDate: string | Date): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: string[] = [];
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(formatLocalDate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * 获取指定日期的开始时间（00:00:00）
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 该日期的开始时间
 * 
 * @example
 * getStartOfDay("2026-01-15T10:30:45.123Z")
 * // 输出: Date 对象，表示 2026-01-15 00:00:00 (用户本地时间)
 */
export function getStartOfDay(isoString: string | Date): Date {
  const date = new Date(isoString);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * 获取指定日期的结束时间（23:59:59）
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 该日期的结束时间
 * 
 * @example
 * getEndOfDay("2026-01-15T10:30:45.123Z")
 * // 输出: Date 对象，表示 2026-01-15 23:59:59 (用户本地时间)
 */
export function getEndOfDay(isoString: string | Date): Date {
  const date = new Date(isoString);
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * 判断两个日期是否是同一天
 * 
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @returns 是否是同一天
 * 
 * @example
 * isSameDay("2026-01-15T10:30:45.123Z", "2026-01-15T23:59:59.999Z")
 * // 输出: true
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  return formatLocalDate(date1) === formatLocalDate(date2);
}

/**
 * 判断是否是今天
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 是否是今天
 * 
 * @example
 * isToday("2026-01-15T10:30:45.123Z") // 当前日期为 2026-01-15
 * // 输出: true
 */
export function isToday(isoString: string | Date): boolean {
  return isSameDay(isoString, new Date());
}

/**
 * 判断是否是昨天
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 是否是昨天
 * 
 * @example
 * isYesterday("2026-01-14T10:30:45.123Z") // 当前日期为 2026-01-15
 * // 输出: true
 */
export function isYesterday(isoString: string | Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(isoString, yesterday);
}

/**
 * 判断是否是明天
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 是否是明天
 * 
 * @example
 * isTomorrow("2026-01-16T10:30:45.123Z") // 当前日期为 2026-01-15
 * // 输出: true
 */
export function isTomorrow(isoString: string | Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(isoString, tomorrow);
}

/**
 * 获取指定日期的周几
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 周几 (0: 周日, 1: 周一, ..., 6: 周六)
 * 
 * @example
 * getDayOfWeek("2026-01-15T10:30:45.123Z")
 * // 输出: 4 (周四)
 */
export function getDayOfWeek(isoString: string | Date): number {
  const date = new Date(isoString);
  return date.getDay();
}

/**
 * 获取指定日期的周几名称
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 周几名称 (如: "周一", "周二", ...)
 * 
 * @example
 * getDayOfWeekName("2026-01-15T10:30:45.123Z")
 * // 输出: "周四"
 */
export function getDayOfWeekName(isoString: string | Date): string {
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const dayOfWeek = getDayOfWeek(isoString);
  return dayNames[dayOfWeek];
}

/**
 * 格式化时间为友好的显示格式
 * 
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 友好的时间显示 (如: "今天 18:30", "昨天 10:30", "周一 10:30")
 * 
 * @example
 * formatFriendlyDateTime("2026-01-15T10:30:45.123Z") // 当前时间为 2026-01-15T11:30:45.123Z
 * // 输出: "今天 18:30"
 */
export function formatFriendlyDateTime(isoString: string | Date): string {
  if (isToday(isoString)) {
    return `今天 ${formatLocalTime(isoString)}`;
  } else if (isYesterday(isoString)) {
    return `昨天 ${formatLocalTime(isoString)}`;
  } else if (isTomorrow(isoString)) {
    return `明天 ${formatLocalTime(isoString)}`;
  } else {
    const dayName = getDayOfWeekName(isoString);
    const time = formatLocalTime(isoString);
    return `${dayName} ${time}`;
  }
}
