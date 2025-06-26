export interface CreateAuditLogDto {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  detail?: any;
  ipAddress?: string;
  userAgent?: string;
}
