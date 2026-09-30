// Global window/globalThis polyfill for legacy GraphQL queries & hooks
const dummyQueryDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'DummyQuery' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: '__typename' } }],
      },
    },
  ],
};

const dummyMutationDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DummyMutation' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: '__typename' } }],
      },
    },
  ],
};

const dummySubscriptionDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'DummySubscription' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: '__typename' } }],
      },
    },
  ],
};

const dummyHook = (query?: any, options?: any): any => ({
  data: undefined,
  loading: false,
  error: undefined,
  refetch: async () => ({ data: undefined }),
  fetchMore: async () => ({ data: undefined }),
  startPolling: () => {},
  stopPolling: () => {},
});

const dummyMut = (mutation?: any, options?: any): any => [
  async () => ({ data: {} }),
  { loading: false, error: undefined, data: undefined, reset: () => {} },
];

const mutationPrefixes = ['CREATE_', 'EDIT_', 'DELETE_', 'UPDATE_', 'SAVE_', 'DUPLICATE_', 'MARK_', 'RESET_', 'SEND_', 'SET_', 'UPLOAD_', 'HARD_DELETE_'];

const allNames = ["CREATE_FOOD","CREATE_RESTAURANT","CREATE_RESTAURANT_COUPON","CREATE_STAFF","CREATE_SUB_CATEGORIES","CREATE_TICKET_MESSAGE","CREATE_VENDOR","CREATE_WITHDRAW_REQUEST","CREATE_ZONE","DELETE_RESTAURANT","HARD_DELETE_RESTAURANT","DELETE_RESTAURANT_COUPON","DELETE_STAFF","DELETE_USER","DELETE_VENDOR","DELETE_ZONE","DUPLICATE_RESTAURANT","EDIT_FOOD","EDIT_RESTAURANT","EDIT_RESTAURANT_COUPON","EDIT_STAFF","EDIT_VENDOR","EDIT_ZONE","GET_ALL_WITHDRAW_REQUESTS","GET_AUDIT_LOGS","GET_CATEGORY_BY_RESTAURANT_ID","GET_CLONED_RESTAURANTS","GET_CONFIGURATION","GET_CUISINES","GET_DASHBOARD_SALES_BY_TYPE","GET_DASHBOARD_USERS_BY_YEAR","GET_FOODS_BY_RESTAURANT_ID","GET_ORDERS_BY_USER","GET_RESTAURANTS","GET_RESTAURANTS_BY_OWNER","GET_RESTAURANT_DASHBOARD_ORDER_SALES_DETAILS_BY_PAYMENT_METHOD","GET_RESTAURANT_DELIVERY_ZONE_INFO","GET_RESTAURANT_PROFILE","GET_SUBCATEGORIES","GET_SUBCATEGORIES_BY_PARENT_ID","GET_TICKET_USERS_WITH_LATEST","GET_USERS_PAGINATED","GET_USER_BY_ID","GET_USER_SUPPORT_TICKETS","GET_VENDORS","GET_VENDOR_BY_ID","GET_VERSIONS","GET_WEB_NOTIFICATIONS","GET_ZONES","MARK_WEB_NOTIFICATIONS_AS_READ","RESET_USER_SESSION","RIDER_UPDATED_SUBSCRIPTION","SAVE_AMPLITUDE_API_KEY_CONFIGURATION","SAVE_APP_CONFIGURATION","SAVE_CLOUDINARY_CONFIGURATION","SAVE_EMAIL_CONFIGURATION","SAVE_FIREBASE_CONFIGURATION","SAVE_GOOGLE_API_KEY_CONFIGURATION","SAVE_GOOGLE_CLIENT_ID_CONFIGURATION","SAVE_PAYPAL_CONFIGURATION","SAVE_SENTRY_CONFIGURATION","SAVE_STRIPE_CONFIGURATION","SAVE_TWILIO_CONFIGURATION","SAVE_VERIFICATION_CONFIGURATION","SEND_NOTIFICATION_USER","SET_VERSIONS","UPDATE_DELIVERY_BOUNDS_AND_LOCATION","UPDATE_DELIVERY_OPTIONS","UPDATE_RESTAURANT_BUSSINESS_DETAILS","UPDATE_RESTAURANT_DELIVERY","UPDATE_TICKET_STATUS","UPDATE_TIMINGS","UPDATE_USER_NOTES","UPDATE_USER_STATUS","UPDATE_WITHDRAW_REQUEST","UPLOAD_TOKEN","UPLOAD_IMAGE_TO_S3"];

const targets: any[] = [];
if (typeof window !== 'undefined') targets.push(window);
if (typeof globalThis !== 'undefined') targets.push(globalThis);

targets.forEach((t) => {
  allNames.forEach((n) => {
    if (n === 'RIDER_UPDATED_SUBSCRIPTION') {
      t[n] = dummySubscriptionDoc;
    } else if (mutationPrefixes.some(p => n.startsWith(p))) {
      t[n] = dummyMutationDoc;
    } else {
      t[n] = dummyQueryDoc;
    }
  });
  if (!('useQuery' in t)) t.useQuery = dummyHook;
  if (!('useMutation' in t)) t.useMutation = dummyMut;
  if (!('useQueryGQL' in t)) t.useQueryGQL = dummyHook;
  if (!('useSubscription' in t)) t.useSubscription = dummyHook;
});

export default dummyQueryDoc;
