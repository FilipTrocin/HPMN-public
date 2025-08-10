export interface WorkflowCallOptions {
  url: string;           // Full URL of the workflow/webhook endpoint
  endpoint?: string;     // Optional path to append to base URL if using config-based URL
  method?: 'GET' | 'POST';
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
}

export async function callWorkflow(options: WorkflowCallOptions): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();

  let url = options.url;
  if (options.endpoint) {
    const base = url.endsWith('/') ? url.slice(0, -1) : url;
    const path = options.endpoint.startsWith('/') ? options.endpoint : `/${options.endpoint}`;
    url = `${base}${path}`;
  }

  if (options.params && Object.keys(options.params).length > 0) {
    const usp = new URLSearchParams(options.params).toString();
    url += (url.includes('?') ? '&' : '?') + usp;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };

  if ((method === 'POST' || options.body) && options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    throw new Error(`Workflow call failed with status: ${response.status}`);
  }
  return response.json();
}
