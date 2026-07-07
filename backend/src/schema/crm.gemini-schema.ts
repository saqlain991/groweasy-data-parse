export const crmArraySchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      created_at: { type: "STRING" },
      name: { type: "STRING" },
      email: { type: "STRING" },
      country_code: { type: "STRING" },
      mobile_without_country_code: { type: "STRING" },
      company: { type: "STRING" },
      city: { type: "STRING" },
      state: { type: "STRING" },
      country: { type: "STRING" },
      lead_owner: { type: "STRING" },
      crm_status: { type: "STRING" },
      crm_note: { type: "STRING" },
      data_source: { type: "STRING" },
      possession_time: { type: "STRING" },
      description: { type: "STRING" },
    },
    required: [
      "created_at","name","email","country_code","mobile_without_country_code",
      "company","city","state","country","lead_owner","crm_status","crm_note",
      "data_source","possession_time","description",
    ],
  },
};
