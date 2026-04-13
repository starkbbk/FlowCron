export const NODE_CATEGORIES = {
  trigger: { label: 'Triggers', color: '#007AFF', accent: 'border-t-[#007AFF]' },
  action: { label: 'Actions', color: '#34C759', accent: 'border-t-[#34C759]' },
  condition: { label: 'Conditions', color: '#FFCC00', accent: 'border-t-[#FFCC00]' },
  logic: { label: 'Logic', color: '#AF52DE', accent: 'border-t-[#AF52DE]' },
}

export const NODE_TYPES = [
  {
    type: 'manual_trigger',
    name: 'Manual Trigger',
    category: 'trigger',
    icon: 'Play',
    description: 'Trigger workflow manually',
    configFields: [],
  },
  {
    type: 'cron_trigger',
    name: 'Schedule (Cron)',
    category: 'trigger',
    icon: 'Clock',
    description: 'Run on a schedule',
    configFields: [
      { name: 'cron_expression', label: 'Cron Expression', type: 'text', placeholder: '*/5 * * * *' },
      { name: 'timezone', label: 'Timezone', type: 'text', placeholder: 'UTC', default: 'UTC' },
    ],
  },
  {
    type: 'webhook_trigger',
    name: 'Webhook',
    category: 'trigger',
    icon: 'Webhook',
    description: 'Trigger via HTTP webhook',
    configFields: [
      { name: 'webhook_url_display', label: 'Webhook URL', type: 'webhook_url_display' },
    ],
  },
  {
    type: 'http_request',
    name: 'HTTP Request',
    category: 'action',
    icon: 'Globe',
    description: 'Make an HTTP request',
    configFields: [
      { name: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/data' },
      { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET' },
      { name: 'headers', label: 'Headers', type: 'key_value_pairs' },
      { name: 'body', label: 'Body (JSON)', type: 'json_editor', placeholder: '{ "key": "value" }' },
      { name: 'timeout', label: 'Timeout', type: 'number', default: 30 },
    ],
  },
  {
    type: 'send_email',
    name: 'Send Email',
    category: 'action',
    icon: 'Mail',
    description: 'Send an email',
    configFields: [
      { name: 'to', label: 'To', type: 'text', placeholder: 'user@example.com' },
      { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' },
      { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Supports variables...' },
    ],
  },
  {
    type: 'send_slack',
    name: 'Slack Message',
    category: 'action',
    icon: 'MessageSquare',
    description: 'Send a Slack message',
    configFields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' },
      { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Variable support: {{node_1.output}}' },
    ],
  },
  {
    type: 'send_discord',
    name: 'Discord Message',
    category: 'action',
    icon: 'MessageCircle',
    description: 'Send a Discord message',
    configFields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...' },
      { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Hello from FlowCron!' },
    ],
  },
  {
    type: 'if_condition',
    name: 'If / Else',
    category: 'condition',
    icon: 'GitBranch',
    description: 'Conditional branching',
    configFields: [
      { name: 'field', label: 'Field to Check', type: 'text', placeholder: '{{node_1.output.status}}' },
      { name: 'condition', label: 'Match Rule', type: 'select', options: [
        'equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains', 'is_empty', 'is_not_empty'
      ], default: 'equals' },
      { name: 'value', label: 'Value', type: 'text', placeholder: '200' },
    ],
    outputs: ['true', 'false'],
  },
  {
    type: 'switch_condition',
    name: 'Switch',
    category: 'condition',
    icon: 'GitMerge',
    description: 'Multi-way branching',
    configFields: [
      { name: 'field', label: 'Field to Check', type: 'text', placeholder: '{{node_1.output.type}}' },
      { name: 'cases', label: 'Cases', type: 'key_value_pairs', placeholder: 'Add Case' },
    ],
  },
  {
    type: 'delay_node',
    name: 'Delay',
    category: 'logic',
    icon: 'Timer',
    description: 'Wait before continuing',
    configFields: [
      { name: 'delay_seconds', label: 'Delay Duration', type: 'number', default: 5 },
    ],
  },
  {
    type: 'transform_node',
    name: 'Transform Data',
    category: 'logic',
    icon: 'Wand2',
    description: 'Reshape and map data',
    configFields: [
      { name: 'output_template', label: 'Output Template', type: 'json_editor', placeholder: '{ "fullName": "{{node_1.output.first}} {{node_1.output.last}}" }' },
    ],
  },
  {
    type: 'code_node',
    name: 'Run Code',
    category: 'logic',
    icon: 'Code',
    description: 'Execute JavaScript code',
    configFields: [
      { name: 'code', label: 'Code (JS)', type: 'code', placeholder: 'return { result: input.value * 2 }' },
    ],
  },
]

export const getNodeType = (type) => NODE_TYPES.find(n => n.type === type)
export const getNodesByCategory = (category) => NODE_TYPES.filter(n => n.category === category)
export const getCategoryColor = (category) => NODE_CATEGORIES[category]?.color || '#8E8E93'
