export type NotificationType =
  | 'VERIFICATION_REQUIRED'
  | 'RESTRICTED_ACCESS'
  | 'INTEGRITY_MISMATCH'
  | 'CASE_UPDATE'
  | 'VERIFICATION_SUCCESS'
  | 'CASE_ASSIGNMENT';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  caseId?: string;
  caseNumber?: string;
  documentId?: string;
  timestamp: string;
  severity: NotificationSeverity;
  targetUrl: string;
  read?: boolean;
}

export interface NotificationsResponse {
  total: number;
  unreadCount: number;
  notifications: NotificationItem[];
}
