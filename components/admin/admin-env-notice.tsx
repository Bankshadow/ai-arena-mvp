"use client";

import { EnvStatusBanner } from "@/components/env/env-status-banner";
import { useTranslations } from "@/components/i18n/locale-provider";

export type AdminEnvStatus = {
  ready: boolean;
  supabaseConfigured: boolean;
  serviceRoleConfigured: boolean;
  adminAuthConfigured: boolean;
  adminAuthRequired: boolean;
  hint: string | null;
};

type AdminEnvNoticeProps = {
  status: AdminEnvStatus | null;
  statusChecked: boolean;
  authFailed?: boolean;
};

export function AdminEnvNotice({ status, statusChecked, authFailed }: AdminEnvNoticeProps) {
  const t = useTranslations();
  const a = t.admin;

  if (!statusChecked) {
    return (
      <EnvStatusBanner
        className="mt-4"
        title={a.envChecking}
        detail={a.envCheckingDetail}
        variant="info"
      />
    );
  }

  if (authFailed) {
    return (
      <EnvStatusBanner
        className="mt-4"
        title={a.authFailedTitle}
        detail={a.authFailedDetail}
        variant="warning"
      />
    );
  }

  if (status?.ready) {
    return (
      <EnvStatusBanner
        className="mt-4"
        title={a.envLiveTitle}
        detail={a.envLiveDetail}
        variant="info"
      />
    );
  }

  if (!status?.supabaseConfigured) {
    return (
      <EnvStatusBanner
        className="mt-4"
        title={a.notConfigured}
        detail={a.envDemoDetail}
        variant="warning"
      />
    );
  }

  if (!status?.serviceRoleConfigured) {
    return (
      <EnvStatusBanner
        className="mt-4"
        title={a.serviceRoleMissing}
        detail={a.envDemoDetail}
        variant="warning"
      />
    );
  }

  if (status.adminAuthRequired && !status.adminAuthConfigured) {
    return (
      <EnvStatusBanner
        className="mt-4"
        title={a.adminAuthMissingTitle}
        detail={a.adminAuthMissingDetail}
        variant="warning"
      />
    );
  }

  return (
    <EnvStatusBanner
      className="mt-4"
      title={a.envDemoTitle}
      detail={status?.hint ?? a.envDemoDetail}
      variant="warning"
    />
  );
}
