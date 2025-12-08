import { onRequestPost as __api_clients_create_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/clients/create.ts"
import { onRequestPut as __api_clients_update_tier_ts_onRequestPut } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/clients/update-tier.ts"
import { onRequestDelete as __api_appointments_ts_onRequestDelete } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/appointments.ts"
import { onRequestGet as __api_appointments_ts_onRequestGet } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/appointments.ts"
import { onRequestPost as __api_appointments_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/appointments.ts"
import { onRequestPut as __api_appointments_ts_onRequestPut } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/appointments.ts"
import { onRequestGet as __api_clients_index_ts_onRequestGet } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/clients/index.ts"
import { onRequestGet as __api_jobs_ts_onRequestGet } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/jobs.ts"
import { onRequestOptions as __api_jobs_ts_onRequestOptions } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/jobs.ts"
import { onRequestPost as __api_jobs_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/jobs.ts"
import { onRequestDelete as __api_jobs_admin_ts_onRequestDelete } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/jobs_admin.ts"
import { onRequestOptions as __api_jobs_admin_ts_onRequestOptions } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/jobs_admin.ts"
import { onRequestPost as __api_jobs_admin_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/jobs_admin.ts"
import { onRequestPut as __api_jobs_admin_ts_onRequestPut } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/jobs_admin.ts"
import { onRequestDelete as __api_log_ts_onRequestDelete } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/log.ts"
import { onRequestGet as __api_log_ts_onRequestGet } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/log.ts"
import { onRequestPost as __api_log_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/log.ts"
import { onRequestGet as __api_resume_ts_onRequestGet } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/resume.ts"
import { onRequestOptions as __api_resume_ts_onRequestOptions } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/resume.ts"
import { onRequestDelete as __api_submissions_ts_onRequestDelete } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/submissions.ts"
import { onRequestGet as __api_submissions_ts_onRequestGet } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/submissions.ts"
import { onRequestOptions as __api_submissions_ts_onRequestOptions } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/submissions.ts"
import { onRequestPost as __api_submissions_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/submissions.ts"
import { onRequestPut as __api_submissions_ts_onRequestPut } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/submissions.ts"
import { onRequestPost as __payments_paypal_capture_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/payments/paypal-capture.ts"
import { onRequestPost as __payments_paypal_order_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/payments/paypal-order.ts"
import { onRequestPost as __payments_stripe_checkout_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/payments/stripe-checkout.ts"
import { onRequest as __api_live_log_ts_onRequest } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/api/live-log.ts"
import { onRequestOptions as __submit_lead_ts_onRequestOptions } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/submit-lead.ts"
import { onRequestPost as __submit_lead_ts_onRequestPost } from "/Users/djsly/.claude-worktrees/kasaglowclean-aistudio/hungry-visvesvaraya/functions/submit-lead.ts"

export const routes = [
    {
      routePath: "/api/clients/create",
      mountPath: "/api/clients",
      method: "POST",
      middlewares: [],
      modules: [__api_clients_create_ts_onRequestPost],
    },
  {
      routePath: "/api/clients/update-tier",
      mountPath: "/api/clients",
      method: "PUT",
      middlewares: [],
      modules: [__api_clients_update_tier_ts_onRequestPut],
    },
  {
      routePath: "/api/appointments",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_appointments_ts_onRequestDelete],
    },
  {
      routePath: "/api/appointments",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_appointments_ts_onRequestGet],
    },
  {
      routePath: "/api/appointments",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_appointments_ts_onRequestPost],
    },
  {
      routePath: "/api/appointments",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_appointments_ts_onRequestPut],
    },
  {
      routePath: "/api/clients",
      mountPath: "/api/clients",
      method: "GET",
      middlewares: [],
      modules: [__api_clients_index_ts_onRequestGet],
    },
  {
      routePath: "/api/jobs",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_jobs_ts_onRequestGet],
    },
  {
      routePath: "/api/jobs",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_jobs_ts_onRequestOptions],
    },
  {
      routePath: "/api/jobs",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_jobs_ts_onRequestPost],
    },
  {
      routePath: "/api/jobs_admin",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_jobs_admin_ts_onRequestDelete],
    },
  {
      routePath: "/api/jobs_admin",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_jobs_admin_ts_onRequestOptions],
    },
  {
      routePath: "/api/jobs_admin",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_jobs_admin_ts_onRequestPost],
    },
  {
      routePath: "/api/jobs_admin",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_jobs_admin_ts_onRequestPut],
    },
  {
      routePath: "/api/log",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_log_ts_onRequestDelete],
    },
  {
      routePath: "/api/log",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_log_ts_onRequestGet],
    },
  {
      routePath: "/api/log",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_log_ts_onRequestPost],
    },
  {
      routePath: "/api/resume",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_resume_ts_onRequestGet],
    },
  {
      routePath: "/api/resume",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_resume_ts_onRequestOptions],
    },
  {
      routePath: "/api/submissions",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_submissions_ts_onRequestDelete],
    },
  {
      routePath: "/api/submissions",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_submissions_ts_onRequestGet],
    },
  {
      routePath: "/api/submissions",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_submissions_ts_onRequestOptions],
    },
  {
      routePath: "/api/submissions",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_submissions_ts_onRequestPost],
    },
  {
      routePath: "/api/submissions",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_submissions_ts_onRequestPut],
    },
  {
      routePath: "/payments/paypal-capture",
      mountPath: "/payments",
      method: "POST",
      middlewares: [],
      modules: [__payments_paypal_capture_ts_onRequestPost],
    },
  {
      routePath: "/payments/paypal-order",
      mountPath: "/payments",
      method: "POST",
      middlewares: [],
      modules: [__payments_paypal_order_ts_onRequestPost],
    },
  {
      routePath: "/payments/stripe-checkout",
      mountPath: "/payments",
      method: "POST",
      middlewares: [],
      modules: [__payments_stripe_checkout_ts_onRequestPost],
    },
  {
      routePath: "/api/live-log",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_live_log_ts_onRequest],
    },
  {
      routePath: "/submit-lead",
      mountPath: "/",
      method: "OPTIONS",
      middlewares: [],
      modules: [__submit_lead_ts_onRequestOptions],
    },
  {
      routePath: "/submit-lead",
      mountPath: "/",
      method: "POST",
      middlewares: [],
      modules: [__submit_lead_ts_onRequestPost],
    },
  ]