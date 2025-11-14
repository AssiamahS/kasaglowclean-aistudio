import { onRequestGet as __api_jobs_ts_onRequestGet } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/jobs.ts"
import { onRequestOptions as __api_jobs_ts_onRequestOptions } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/jobs.ts"
import { onRequestPost as __api_jobs_ts_onRequestPost } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/jobs.ts"
import { onRequestDelete as __api_jobs_admin_ts_onRequestDelete } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/jobs_admin.ts"
import { onRequestOptions as __api_jobs_admin_ts_onRequestOptions } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/jobs_admin.ts"
import { onRequestPost as __api_jobs_admin_ts_onRequestPost } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/jobs_admin.ts"
import { onRequestPut as __api_jobs_admin_ts_onRequestPut } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/jobs_admin.ts"
import { onRequestGet as __api_resume_ts_onRequestGet } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/resume.ts"
import { onRequestOptions as __api_resume_ts_onRequestOptions } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/resume.ts"
import { onRequestDelete as __api_submissions_ts_onRequestDelete } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/submissions.ts"
import { onRequestGet as __api_submissions_ts_onRequestGet } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/submissions.ts"
import { onRequestOptions as __api_submissions_ts_onRequestOptions } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/submissions.ts"
import { onRequestPost as __api_submissions_ts_onRequestPost } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/submissions.ts"
import { onRequestPut as __api_submissions_ts_onRequestPut } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/api/submissions.ts"
import { onRequestOptions as __submit_lead_ts_onRequestOptions } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/submit-lead.ts"
import { onRequestPost as __submit_lead_ts_onRequestPost } from "/Users/djsly/Code/kasaglow-cleaning-services-website-v4/functions/submit-lead.ts"

export const routes = [
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